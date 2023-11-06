use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;

declare_id!("9EmLqGabCEBX8ZQFJxc6FR8c3NhdofnyBTnYPqX4MviD");

#[program]
pub mod todo_list_app {
    use super::*;

    pub fn add_task(ctx: Context<AddTask>, text: String) -> ProgramResult {
        let task = &mut ctx.accounts.task;
        let author = &ctx.accounts.user;

        let now = Clock::get()?.unix_timestamp;
        task.author = author.key();
        task.is_done = false;
        task.text = text;
        task.created_at = now;
        task.updated_at = now;

        Ok(())
    }

    pub fn update_task(ctx: Context<UpdateTask>, is_done: bool) -> Result<()> {
        let task = &mut ctx.accounts.task;

        let now = Clock::get()?.unix_timestamp;
        task.is_done = is_done;
        task.updated_at = now;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct AddTask<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        payer = user,
        space = Task::LEN,
        )]
    pub task: Account<'info, Task>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateTask<'info> {
    pub author: Signer<'info>,
    #[account(mut, has_one = author)]
    pub task: Account<'info, Task>,
}

#[derive(Accounts)]
pub struct DeleteTask<'info> {
    pub author: Signer<'info>,
    #[account(mut, has_one = author)]
    pub task: Account<'info, Task>,
}

#[account]
pub struct Task {
    pub author: Pubkey,
    pub is_done: bool,
    pub text: String,
    pub created_at: i64,
    pub updated_at: i64,
}

impl Task {
    const LEN: usize = 8 + 32 + 1 + 4 + 400 * 4 + 8 + 8;
}
