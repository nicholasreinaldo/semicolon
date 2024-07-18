"use client";

import { trpc } from "@/lib/trpc";
import React from "react";

export const TrpcProvider = trpc.withTRPC(
  (props: React.PropsWithChildren) => props.children,
) as React.ComponentType<React.PropsWithChildren>;
