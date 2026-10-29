<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Builder generation is real AI: `generateApp` in `src/lib/generate.functions.ts` returns one self-contained `/index.html` (Tailwind CDN + vanilla JS) rendered in a sandboxed iframe; follow-up prompts send the current HTML for edits. The `workspace.ts`/`PreviewApp` spec demo shows only before the first generation. Why: a single HTML file previews instantly without a bundler.
