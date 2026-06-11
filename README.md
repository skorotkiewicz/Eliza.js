=== Eliza.js chatbot in NodeJS ===

Requires Node.js.

Run:

```
node eliza.js
```

Usage:

```
http://127.0.0.1:1337/YOUR_MESSAGE
http://127.0.0.1:1337/?q=YOUR_MESSAGE
http://127.0.0.1:1337/reset
```

Set `HOST` or `PORT` to override the default listener:

```
HOST=0.0.0.0 PORT=3000 node eliza.js
```

Research sources:

- ELIZAGEN: Original ELIZA - https://sites.google.com/view/elizagen-org/original-eliza
- ELIZA Reanimated: The world's first chatbot restored on the world's first time sharing system - https://arxiv.org/abs/2501.06707
