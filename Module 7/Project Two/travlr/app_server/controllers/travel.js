const { api } = require('../middleware/customer-session');
const { presentTrip } = require('./customer');
const travel = async (req,res,next) => {
  try {
    const params=new URLSearchParams();
    for(const key of ['q','minPrice','maxPrice']) if(typeof req.query[key]==='string') params.set(key,req.query[key]);
    const trips=await api('/trips?'+params.toString());
    res.render('travel',{title:'Travlr Getaways',trips:trips.map(presentTrip),q:req.query.q,minPrice:req.query.minPrice,maxPrice:req.query.maxPrice});
  }catch(error){next(error);}
};
const detail=async(req,res,next)=>{
  try{const [trip]=await api('/trips/'+encodeURIComponent(req.params.tripCode));res.render('trip-detail',{title:trip.name,trip:presentTrip(trip)});}
  catch(error){next(error);}
};
module.exports={travel,detail};
