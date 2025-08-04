
import * as jose from 'jose'

type Payload ={
    uid:string,
    plan: string

}
if(!process.env.SHARED_JWT_SECRET) {
        throw new Error('JWT secret are not present')
} 
const secret = new TextEncoder().encode(process.env.SHARED_JWT_SECRET)
export default async function generateJWT(payload:Payload){
    
    const jwt = await new jose.SignJWT(payload)
    .setProtectedHeader({alg:'HS256'})
    .setIssuer('token_gateway')
    .setAudience('app_api')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret)
    

    return jwt
}