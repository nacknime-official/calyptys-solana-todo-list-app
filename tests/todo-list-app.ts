import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TodoListApp } from "../target/types/todo_list_app";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("todo-list-app", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const user = provider.wallet;
  const program = anchor.workspace.TodoListApp as Program<TodoListApp>;

  const taskKeyPair = anchor.web3.Keypair.generate();

  it("Adds a task", async () => {
    const text = "testtask";

    const txSig = await program.methods.addTask(text)
      .accounts({
        user: user.publicKey,
        task: taskKeyPair.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([taskKeyPair])
      .rpc();
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      signature: txSig,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    }, "confirmed");
    const tx = await provider.connection.getParsedTransaction(txSig, "confirmed");

    const task = await program.account.task.fetch(taskKeyPair.publicKey);

    expect(task.text).eq(text);
    expect(task.author.toString()).eq(user.publicKey.toString());
    expect(task.isDone).eq(false);
    expect(task.createdAt.toString()).eq(tx.blockTime.toString())
    expect(task.updatedAt.toString()).eq(tx.blockTime.toString())
  })

  it("Updates a task", async () => {
    const txSig = await program.methods.updateTask(true)
      .accounts({
        author: user.publicKey,
        task: taskKeyPair.publicKey,
      })
      .rpc();
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      signature: txSig,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    }, "confirmed");
    const tx = await provider.connection.getParsedTransaction(txSig, "confirmed");

    const task = await program.account.task.fetch(taskKeyPair.publicKey);

    expect(task.isDone).eq(true);
    expect(task.updatedAt.toString()).eq(tx.blockTime.toString());
  })
});
