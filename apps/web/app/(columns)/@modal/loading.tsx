import * as Dialog from "@radix-ui/react-dialog";
import Spinner from "@semicolon/ui/spinner";
import _ from "lodash";
import React from "react";

export default function Loading() {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80" />
        <Dialog.Content className="fixed inset-0 z-50 flex h-screen flex-row items-center justify-center">
          <Spinner size={30} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
