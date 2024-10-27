import { SignJWT, importPKCS8 } from 'jose';
import { Database } from 'firebase-firestore-lite';

export class DB {
  public client: Database
  private token: string = ''

  constructor(project_id: string, service_account: string) {
    const serviceAccount = JSON.parse(service_account)
    const that = this
    this.client = new Database({
      projectId: project_id,
      auth: {
        /**
        * Uses native fetch, but adds authorization headers, otherwise, the API is exactly the same as native fetch.
        * @param {Request|Object|string} resource A request to send. It can be a resource or an options object.
        * @param {Object} init An options object.
        */
        authorizedRequest: async (resource, init) => {
          const request = resource instanceof Request ? resource : new Request(resource, init);
          const token = this.token || await that.generateToken(serviceAccount);
          request.headers.set('Authorization', `Bearer ${token}`);
          return fetch(request);
        }
      }
    })
  }

  private async generateToken(serviceAccount: any): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const key = await importPKCS8(serviceAccount.private_key, 'RS256');
    const token = await new SignJWT({
      iss: serviceAccount.client_email,
      sub: serviceAccount.client_email,
      aud: 'https://firestore.googleapis.com/',
      iat: now,
      exp: now + 3600
    })
      .setProtectedHeader({
          alg: "RS256",
          typ: "JWT",
          kid: serviceAccount.private_key_id,
      })
      .sign(key);
    this.token = token
    return token
  }
}
