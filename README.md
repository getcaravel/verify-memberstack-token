# verify-memberstack-token

> Verify memberstack token and return user decoded

### Installation

```bash
npm install verify-memberstack-token
```

### Usage

```javascript
const checkMsToken = require('verify-memberstack-token');

...

const user = await checkMsToken.verifyAndGetUser(token);
console.log(user);
```
