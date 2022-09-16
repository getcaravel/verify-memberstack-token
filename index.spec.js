jest.mock('axios');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const index = require('./index');

describe('verify-memberstack-token: index', () => {
  describe('verifyAndGetUser', () => {
    const fakeToken = jwt.sign({ email: 'jose@test.com' }, 'blabla', { header: { kid: 'aaaa' } });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('Should fail if no correct token', async () => {
      try {
        await index.verifyAndGetUser('aaa.bbb.ccc');
      } catch (err) {
        expect(err.message).toMatch(/verify-memberstack-token error :\nerr=TypeError: Cannot destructure property 'header' of .* as it is null\./);
        expect(axios.get.mock.calls.length).toBe(0);
        return;
      }
      throw new Error('Should have thrown an error');
    });

    test('Should fail if getting public key failed', async () => {
      axios.get.mockRejectedValue(new Error('test error axios'));
      try {
        await index.verifyAndGetUser(fakeToken);
      } catch (err) {
        expect(err.message).toBe('verify-memberstack-token error :\nerr=Error: While getting key [aaaa] at https://api.memberstack.io/metadata/v1/public-keys:\nerr=Error: test error axios');
        expect(axios.get.mock.calls.length).toBe(1);
        return;
      }
      throw new Error('Should have thrown an error');
    });

    test('Should fail if public does not return wanted key id', async () => {
      axios.get.mockResolvedValue({
        data: { bbbb: 'blabla' },
      });
      try {
        await index.verifyAndGetUser(fakeToken);
      } catch (err) {
        expect(err.message).toBe('verify-memberstack-token error :\nerr=Error: While getting key [aaaa] at https://api.memberstack.io/metadata/v1/public-keys:\nerr=Error: No kid corresponding');
        expect(axios.get.mock.calls.length).toBe(1);
        return;
      }
      throw new Error('Should have thrown an error');
    });

    test('Should fail if public key is incorrect', async () => {
      axios.get.mockResolvedValue({
        data: { aaaa: 'bloblob' },
      });
      try {
        await index.verifyAndGetUser(fakeToken);
      } catch (err) {
        expect(err.message).toBe('verify-memberstack-token error :\nerr=JsonWebTokenError: invalid signature');

        return;
      }
      throw new Error('Should have thrown an error');
    });

    test('Should succeed', async () => {
      axios.get.mockResolvedValue({
        data: { aaaa: 'blabla' },
      });
      const user = await index.verifyAndGetUser(fakeToken);
      delete (user.iat); // Removes value added by jwt, not the point to test this value here
      expect(user).toEqual({ email: 'jose@test.com' });
      expect(axios.get.mock.calls.length).toBe(1);
    });
  });
});
