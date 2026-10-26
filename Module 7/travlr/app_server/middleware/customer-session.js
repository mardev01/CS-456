const crypto=require('crypto');
const {jwtSecret}=require('../../app_api/config/environment');
const cookieName='travlr_customer';
const options={httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/'};
const apiBase=()=>`http://127.0.0.1:${process.env.PORT||3000}/api`;
const api=async(path,method='GET',body,token)=>{
  const headers={'Content-Type':'application/json'};
  if(token)headers.Authorization=`Bearer ${token}`;
  const response=await fetch(apiBase()+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
  const data=await response.json();
  if(!response.ok){const error=new Error(data.message||'The request could not be completed.');error.status=response.status;throw error;}
  return data;
};
const session=async(req,res,next)=>{
  try{
    req.customerToken=req.cookies[cookieName];
    if(req.customerToken){
      try{req.customer=await api('/customer/me','GET',undefined,req.customerToken);res.locals.currentCustomer=req.customer;}
      catch(error){if(error.status===401){res.clearCookie(cookieName,options);req.customerToken=null;}else throw error;}
    }
    const supplied=req.cookies.travlr_csrf;
    const nonce=typeof supplied==='string'&&/^[a-f0-9]{64}$/.test(supplied)?supplied:crypto.randomBytes(32).toString('hex');
    const signature=crypto.createHmac('sha256',jwtSecret).update(`${req.customerToken||'anonymous'}:${nonce}`).digest('hex');
    const csrf=`${nonce}.${signature}`;
    if(!supplied)res.cookie('travlr_csrf',nonce,options);
    res.locals.csrfToken=csrf;
    if(req.method==='POST'){
      const actual=req.body?._csrf;
      const origin=req.get('Origin');
      const sameOrigin=origin===`${req.protocol}://${req.get('host')}`;
      if(!sameOrigin||typeof actual!=='string'||actual.length!==csrf.length||!crypto.timingSafeEqual(Buffer.from(actual),Buffer.from(csrf))){
        return res.status(403).render('message',{title:'Please try again',message:'This form has expired or came from another site. Reload the page and try again.'});
      }
    }
    next();
  }catch(error){next(error);}
};
const requireCustomer=(req,res,next)=>req.customer?next():res.redirect('/account/login?returnTo='+encodeURIComponent(req.originalUrl));
const setLogin=(res,token)=>res.cookie(cookieName,token,{...options,maxAge:60*60*1000});
const logout=res=>res.clearCookie(cookieName,options);
const safeReturn=value=>typeof value==='string'&&/^\/(checkout(?:\?|$)|reservations(?:\/|$)|account\/profile$)/.test(value)?value:'/reservations';
module.exports={api,session,requireCustomer,setLogin,logout,safeReturn};
