import {jwtVerify} from 'jose'
if(!process.env.SHARED_JWT_SECRET) {
        throw new Error('JWT secret are not present')
} 
const secret = new TextEncoder().encode(process.env.SHARED_JWT_SECRET)
export default async function verifyJWT(jwtToken: string){
    try{
        const {payload} = await jwtVerify(jwtToken,secret,{issuer:'token_gateway',audience:'app_api'})
        console.log('succes verified token')
        return payload
    }
    catch(error){
        console.log('token invalid',error)
        return null
    }
}

