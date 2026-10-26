const crypto = require('crypto');
const Reservation = require('../models/reservation');
const Trip = require('../models/travlr');
const validId = value => /^[a-f0-9]{24}$/i.test(value);
const create = async (req,res) => {
  const { tripCode, travelers, requestKey } = req.body || {};
  if (typeof tripCode !== 'string' || !Number.isInteger(travelers) || travelers<1 || travelers>10 ||
      typeof requestKey !== 'string' || !/^[a-zA-Z0-9_-]{16,80}$/.test(requestKey)) {
    return res.status(400).json({ message:'Choose a trip and between 1 and 10 travelers.' });
  }
  await Reservation.init();
  const previous = await Reservation.findOne({ customer:req.customer.id,requestKey });
  if (previous) {
    if (previous.trip.code!==tripCode || previous.travelers!==travelers) return res.status(409).json({message:'This checkout was already used for another reservation.'});
    return res.json(previous);
  }
  const trip=await Trip.findOne({code:tripCode});
  if (!trip) return res.status(404).json({message:'Trip not found.'});
  if (trip.start.getTime()<=Date.now()) return res.status(400).json({message:'This trip has already departed. Please choose a future trip.'});
  const cents=Math.round(Number(trip.perPerson)*100);
  if (!Number.isSafeInteger(cents*travelers)) return res.status(400).json({message:'Trip pricing is unavailable.'});
  const snapshot=Object.fromEntries(['code','name','length','start','resort','image'].map(key=>[key,trip[key]]));
  try {
    const reservation=await Reservation.create({customer:req.customer.id,requestKey,reference:'TG-'+crypto.randomBytes(6).toString('hex').toUpperCase(),
      trip:snapshot,travelers,pricePerPersonCents:cents,totalCents:cents*travelers});
    return res.status(201).json(reservation);
  } catch (error) {
    if(error.code===11000) {
      const existing=await Reservation.findOne({customer:req.customer.id,requestKey});
      if(existing && existing.trip.code===tripCode && existing.travelers===travelers) return res.json(existing);
    }
    throw error;
  }
};
const listOwn=async(req,res)=>res.json(await Reservation.find({customer:req.customer.id}).sort({createdAt:-1}));
const getOwn=async(req,res)=>{
  const reservation=validId(req.params.reservationId) ? await Reservation.findOne({_id:req.params.reservationId,customer:req.customer.id}) : null;
  if(!reservation)return res.status(404).json({message:'Reservation not found.'});
  res.json(reservation);
};
const cancelOwn=async(req,res)=>{
  const reservation=validId(req.params.reservationId) ? await Reservation.findOne({_id:req.params.reservationId,customer:req.customer.id}) : null;
  if(!reservation)return res.status(404).json({message:'Reservation not found.'});
  if(reservation.trip.start.getTime()<=Date.now())return res.status(400).json({message:'Contact Travlr to discuss a trip that has already departed.'});
  reservation.status='cancelled';await reservation.save();res.json(reservation);
};
const listAll=async(req,res)=>res.json(await Reservation.find({}).populate('customer','name email').sort({createdAt:-1}));
const update=async(req,res)=>{
  if(!['confirmed','cancelled'].includes(req.body.status))return res.status(400).json({message:'Choose confirmed or cancelled.'});
  const reservation=validId(req.params.reservationId) ? await Reservation.findByIdAndUpdate(req.params.reservationId,{$set:{status:req.body.status}},{returnDocument:'after',runValidators:true}).populate('customer','name email') : null;
  if(!reservation)return res.status(404).json({message:'Reservation not found.'});res.json(reservation);
};
module.exports={create,listOwn,getOwn,cancelOwn,listAll,update};
