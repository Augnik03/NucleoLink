"use client";

import * as Ably from "ably";
import ChatBox from "./chat-box.jsx";

export default function Chat() {
  const client = new Ably.Realtime({
    key: "8ZFK5w.o7m0dA:ilXS8y-meB0x5qTz2yBbnclgvz3q9elkkXE_7yfv_sg",
  });
  return <ChatBox />;
}
