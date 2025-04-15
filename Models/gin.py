import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import GINConv, global_mean_pool
from torch_geometric.data import Data, DataLoader
from rdkit import Chem
import pandas as pd
import numpy as np
from sklearn.metrics import roc_auc_score
import matplotlib.pyplot as plt

# Graph Data Preparation
def atom_features(atom):
    return torch.tensor([
        atom.GetAtomicNum(),
        atom.GetDegree(),
        atom.GetImplicitValence(),
        atom.GetFormalCharge(),
        int(atom.GetIsAromatic())
    ], dtype=torch.float)

def smiles_to_graph(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        return None
    
    # Node features
    x = torch.stack([atom_features(atom) for atom in mol.GetAtoms()])
    
    # Edge indices
    edge_index = []
    for bond in mol.GetBonds():
        i, j = bond.GetBeginAtomIdx(), bond.GetEndAtomIdx()
        edge_index.extend([[i, j], [j, i]])
    
    return Data(
        x=x,
        edge_index=torch.tensor(edge_index).t().contiguous() if edge_index else torch.empty((2, 0), dtype=torch.long)
    )

# GIN Model
class GIN(nn.Module):
    def __init__(self, hidden_dim=64):
        super().__init__()
        self.conv1 = GINConv(nn.Sequential(
            nn.Linear(5, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim))
        )
        self.conv2 = GINConv(nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim))
        )
        self.classifier = nn.Linear(hidden_dim, 2)
    
    def forward(self, x, edge_index, batch):
        x = self.conv1(x, edge_index).relu()
        x = self.conv2(x, edge_index).relu()
        x = global_mean_pool(x, batch)
        return self.classifier(x)

# Main Execution
if __name__ == "__main__":
    df = pd.read_csv("tox21.csv")
    target = "NR-AR"  # Change target as needed
    
    # Prepare graph data
    graphs = []
    for _, row in df.iterrows():
        if not pd.isna(row[target]) and row[target] != -1:
            g = smiles_to_graph(row['smiles'])
            if g is not None:
                g.y = torch.tensor([int(row[target])], dtype=torch.long)
                graphs.append(g)

    # Train/test split
    train_size = int(0.8 * len(graphs))
    train_dataset = graphs[:train_size]
    test_dataset = graphs[train_size:]

    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=32)

    # Training setup
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = GIN().to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.CrossEntropyLoss()

    # Training loop
    train_losses = []
    test_aucs = []
    
    for epoch in range(1, 21):
        model.train()
        total_loss = 0
        for batch in train_loader:
            batch = batch.to(device)
            optimizer.zero_grad()
            out = model(batch.x, batch.edge_index, batch.batch)
            loss = criterion(out, batch.y.squeeze())
            loss.backward()
            optimizer.step()
            total_loss += loss.item()
        
        train_losses.append(total_loss / len(train_loader))

        # Evaluation
        model.eval()
        y_true, y_pred = [], []
        with torch.no_grad():
            for batch in test_loader:
                batch = batch.to(device)
                out = model(batch.x, batch.edge_index, batch.batch)
                y_pred.extend(F.softmax(out, dim=1)[:, 1].cpu().numpy())
                y_true.extend(batch.y.cpu().numpy())
        
        auc = roc_auc_score(y_true, y_pred)
        test_aucs.append(auc)
        print(f"Epoch {epoch:02d} | Loss: {train_losses[-1]:.4f} | AUC: {auc:.4f}")

    # Save results
    torch.save(model.state_dict(), "gin_tox21.pt")
    plt.figure(figsize=(12, 4))
    plt.subplot(121)
    plt.plot(train_losses, label="Training Loss")
    plt.subplot(122)
    plt.plot(test_aucs, label="Test AUC")
    plt.savefig("gin_performance.png")