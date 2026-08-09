# Backend tests

- `unit/` tests schemas, prompt interpretation, and retry policy without network calls.
- `integration/` tests the complete generator pipeline using model mocks, including malformed output, repair, fallbacks, and safe failures.
- `live/` is opt-in because it consumes OpenRouter free-model requests.

Run the normal suite:

```text
npm test
```

Run the live structured-output test after setting `OPENROUTER_API_KEY` in `.env.local`:

```text
npm run test:live
```
