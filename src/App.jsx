import { useState, useEffect, useRef, useCallback } from "react";
import { GRAMMAR_TOPICS,GRAMMAR_CATS } from "./grammarData";
import LandingPage from "./LandingPage";
import DesktopApp from "./DesktopApp";
const LOGO="/logo.png";

const PK="e5k_p13",QK="e5k_q13_",CS_PK="e5k_cs13",CS_QK="e5k_csq13_",SK="e5k_s13",UK="e5k_u13";
const toStr=()=>new Date().toISOString().slice(0,10);
const ystStr=()=>{const d=new Date();d.setDate(d.getDate()-1);return d.toISOString().slice(0,10);};
const DEF={day:1,streak:0,lastDate:null,totalCorrect:0,totalAnswered:0,xp:0,bestStreak:0};
const CFG_DEF={sound:true,dark:false};
const LVLS=[{n:"Beginner",min:0,c:"#9CA3AF",i:"🌱"},{n:"Elementary",min:500,c:"#22C55E",i:"🌿"},{n:"Pre-Int",min:1500,c:"#3B82F6",i:"📘"},{n:"Intermediate",min:3500,c:"#8B5CF6",i:"⭐"},{n:"Upper-Int",min:7000,c:"#F59E0B",i:"🌟"},{n:"Advanced",min:12000,c:"#EF4444",i:"🔥"},{n:"Expert",min:20000,c:"#EC4899",i:"💎"}];
const getLv=(xp)=>{let l=LVLS[0];for(const x of LVLS)if((xp||0)>=x.min)l=x;return l;};
const getNext=(xp)=>{for(const x of LVLS)if((xp||0)<x.min)return x;return null;};
const QDAY=d=>d<=33?"Easy":d<=66?"Medium":"Hard";
const DIFF_ORDER=["Easy","Medium","Hard"];
const PERF_PK="e5k_perf";
function getPerfHistory(){try{return JSON.parse(localStorage.getItem(PERF_PK))||[];}catch{return[];}}
function savePerfHistory(h){localStorage.setItem(PERF_PK,JSON.stringify(h.slice(-20)));}
function recordPerf(acc){const h=getPerfHistory();h.push({acc,ts:Date.now()});savePerfHistory(h);}
function getAdaptDiff(dayDiff){
  const h=getPerfHistory();if(h.length<2)return dayDiff;
  const last5=h.slice(-5);const avg=last5.reduce((s,x)=>s+x.acc,0)/last5.length;
  const idx=DIFF_ORDER.indexOf(dayDiff);
  if(avg>=80&&idx<2)return DIFF_ORDER[idx+1];
  if(avg<45&&idx>0)return DIFF_ORDER[idx-1];
  return dayDiff;
}
const LC={Easy:{fill:"#22C55E",bg:"rgba(34,197,94,.1)",br:"rgba(34,197,94,.32)",tx:"#16A34A"},Medium:{fill:"#3B82F6",bg:"rgba(59,130,246,.1)",br:"rgba(59,130,246,.32)",tx:"#2563EB"},Hard:{fill:"#EF4444",bg:"rgba(239,68,68,.1)",br:"rgba(239,68,68,.32)",tx:"#DC2626"}};
const CS_LC={Easy:{fill:"#06B6D4",bg:"rgba(6,182,212,.1)",br:"rgba(6,182,212,.32)",tx:"#0891B2"},Medium:{fill:"#8B5CF6",bg:"rgba(139,92,246,.1)",br:"rgba(139,92,246,.32)",tx:"#7C3AED"},Hard:{fill:"#F97316",bg:"rgba(249,115,22,.1)",br:"rgba(249,115,22,.32)",tx:"#EA580C"}};
const TH={light:{root:"#f3f5fb",s1:"#edf0f7",s2:"#fff",bd:"rgba(0,0,0,.07)",bdS:"rgba(0,0,0,.13)",txt:"#111827",m:"#6b7280",s:"#4b5563"},dark:{root:"#0c111a",s1:"#141c2b",s2:"#1c2540",bd:"rgba(255,255,255,.07)",bdS:"rgba(255,255,255,.14)",txt:"#e8edf5",m:"#8b95a8",s:"#9ca3af"}};
const AVCLR=["#3B82F6","#22C55E","#F59E0B","#EF4444","#8B5CF6","#EC4899","#06B6D4","#F97316"];
const avC=n=>AVCLR[(n.toUpperCase().charCodeAt(0)||65)%AVCLR.length];
const ADS=[{ic:"🚀",t:"Learn English Faster!",s:"AI coaching — 7 days free",c:"#3B82F6"},{ic:"📚",t:"Grammar Pro Course",s:"Master all tenses in 30 days",c:"#8B5CF6"},{ic:"🎓",t:"IELTS Prep Academy",s:"Band 7+ guaranteed or refund",c:"#F59E0B"},{ic:"💬",t:"Native Speakers Online",s:"Practice conversations anytime",c:"#22C55E"}];
const XP={mcq:10,wrt0:15,wrt1:8,wrt2:4,s5:5,s10:10,s20:20};
const TOPICS={
  Easy:`Generate complete SENTENCES in Egyptian Arabic. "ar"=full sentence, "en"=English, "pron"=how to pronounce English using Arabic letters (e.g."Good morning"→"جود مورنينج"/"How are you?"→"هاو أر يو؟"/"My name is"→"ماي نيم إز"). Topics: greetings, self-intro, family, food, daily activities.`,
  Medium:`Generate complete Egyptian Arabic SENTENCES. "ar"=sentence, "en"=English, "pron"=English pronunciation in Arabic letters (e.g."Can you help me?"→"كان يو هيلب مي؟"). Topics: travel, shopping, work, health, weather, opinions.`,
  Hard:`Generate complex Egyptian Arabic SENTENCES. "ar"=sentence, "en"=English, "pron"=pronunciation in Arabic letters (e.g."Give up"→"جيف أب"/"Break a leg"→"بريك أ ليج"). Topics: idioms, formal English, business, academic vocabulary.`
};
const CS_TOPICS={
  Easy:`Generate 50 CS/programming English questions for Egyptian Arabic developers. "ar"=Egyptian Arabic CS sentence, "en"=English, "pron"=pronunciation in Arabic letters (e.g."It works!"→"إت وركس!"/"File not found"→"فايل نوت فاوند"/"Run the code"→"ران ذا كود"/"Permission denied"→"بيرميشن دينايد"). Topics: developer phrases (It works!/It crashed/Save the file/Debug the program), Linux basics (ls/cd/mkdir/grep), Git basics (git commit/push/pull), error messages (Syntax error/Segmentation fault), basic CS concepts (variable/function/loop/class).`,
  Medium:`Generate 50 CS intermediate English questions for Egyptian Arabic developers. "ar"=Arabic CS sentence, "en"=English, "pron"=pronunciation in Arabic letters (e.g."Compile the code"→"كومبايل ذا كود"/"Pull request"→"بول ريكويست"/"Memory leak"→"ميموري ليك"/"Code review"→"كود ريفيو"). Topics: C/C++ (pointer/memory/compile/debug/null pointer/template/class/inheritance), Python (import/exception/decorator/generator), dev phrases (What's the bug?/Problem solved/Code review/Pull request merged/Deploy to production/The build failed), debugging, GitHub workflow.`,
  Hard:`Generate 50 advanced CS English questions for Egyptian Arabic developers. "ar"=Arabic sentence, "en"=English, "pron"=pronunciation in Arabic letters (e.g."Gradient descent"→"جراديينت ديسينت"/"Overfitting"→"أوفرفيتينج"/"Mutex prevents race conditions"→"ميوتكس بريفينتس ريس كونديشنز"/"Time complexity"→"تايم كومبليكسيتي"). Topics: AI/ML (train a model/overfitting/gradient descent/neural network/backpropagation/hyperparameter), algorithms (binary search/recursion/Big O notation/dynamic programming/divide and conquer), systems (kernel/mutex/race conditions/stack overflow/memory leak/thread safety/deadlock), architecture (microservices/Docker/Kubernetes/CI-CD/SOLID principles).`
};
const CS_CATS={Easy:["Linux Basics","Git","Error Messages","Developer Phrases","Code Basics"],Medium:["C/C++","Python","Debugging","GitHub Workflow","Professional"],Hard:["AI/ML","Algorithms","Systems","Architecture","Security"]};

async function lP(k=PK){try{const v=localStorage.getItem(k);return v?{...DEF,...JSON.parse(v)}:{...DEF};}catch{return{...DEF};}}
async function sP(p,k=PK){try{localStorage.setItem(k,JSON.stringify(p));}catch{}}
async function lCfg(){try{const v=localStorage.getItem(SK);return v?{...CFG_DEF,...JSON.parse(v)}:{...CFG_DEF};}catch{return{...CFG_DEF};}}
async function sCfg(c){try{localStorage.setItem(SK,JSON.stringify(c));}catch{}}
async function lU(){try{const v=localStorage.getItem(UK);return v?JSON.parse(v):null;}catch{return null;}}
async function sU(u){try{localStorage.setItem(UK,JSON.stringify(u));}catch{}}
async function lQ(d,prefix=QK){try{const v=localStorage.getItem(prefix+d);if(v){const x=JSON.parse(v);if(x.date===toStr()&&Array.isArray(x.qs)&&x.qs.length>=5)return x.qs;}return null;}catch{return null;}}
async function sQ(d,qs,prefix=QK){try{localStorage.setItem(prefix+d,JSON.stringify({date:toStr(),qs}));}catch{}}

const FB_EASY=[
{ar:"إزيك؟",en:"How are you?",pron:"هاو أر يو؟",opts:["How are you?","Where are you?","Who are you?","What are you?"],c:0,cat:"Greetings"},
{ar:"أنا بخير، شكراً",en:"I'm fine, thank you.",pron:"آيم فاين، ثانك يو",opts:["I'm fine, thank you.","I'm bad, thank you.","I'm fine, please.","I'm good, sorry."],c:0,cat:"Greetings"},
{ar:"إسمي أحمد",en:"My name is Ahmed.",pron:"ماي نيم إز أحمد",opts:["My name is Ahmed.","My name is Ali.","I am Ahmed name.","Ahmed is my name."],c:0,cat:"Self Introduction"},
{ar:"عندك كام سنة؟",en:"How old are you?",pron:"هاو أولد أر يو؟",opts:["How old are you?","How are you old?","Where are you old?","What old are you?"],c:0,cat:"Self Introduction"},
{ar:"أنا عندي 25 سنة",en:"I am 25 years old.",pron:"آيم تونتي فايف ييرز أولد",opts:["I am 25 years old.","I have 25 years old.","I am 25 year old.","25 years old I am."],c:0,cat:"Self Introduction"},
{ar:"شكراً ليك",en:"Thank you.",pron:"ثانك يو",opts:["Thank you.","Think you.","Tank you.","Three you."],c:0,cat:"Greetings"},
{ar:"عفواً",en:"You're welcome.",pron:"يور ويلكوم",opts:["You're welcome.","You are welcome.","Your welcome.","Yore welcome."],c:0,cat:"Greetings"},
{ar:"مع السلامة",en:"Goodbye.",pron:"جودباي",opts:["Goodbye.","Good buy.","Go bye.","Good day."],c:0,cat:"Greetings"},
{ar:"تصبح على خير",en:"Good night.",pron:"جود نايت",opts:["Good night.","Good knight.","Good nit.","Good night."],c:0,cat:"Greetings"},
{ar:"صباح الخير",en:"Good morning.",pron:"جود مورنينج",opts:["Good morning.","Good mourning.","Good morning.","Good moning."],c:0,cat:"Greetings"},
{ar:"العربية بتاعتي حلوة",en:"My car is nice.",pron:"ماي كار إز نايس",opts:["My car is nice.","My cat is nice.","My cup is nice.","My can is nice."],c:0,cat:"Family"},
{ar:"أمي جميلة",en:"My mother is beautiful.",pron:"ماي ماذر إز بيوتيفل",opts:["My mother is beautiful.","My father is beautiful.","My mother is big.","My mother is busy."],c:0,cat:"Family"},
{ar:"أنا بحب أهلي",en:"I love my family.",pron:"آي لاف ماي فاميلي",opts:["I love my family.","I love my friend.","I live my family.","I left my family."],c:0,cat:"Family"},
{ar:"أنا جعان",en:"I'm hungry.",pron:"آيم هانجري",opts:["I'm hungry.","I'm happy.","I'm hurry.","I'm heavy."],c:0,cat:"Food"},
{ar:"أنا عطشان",en:"I'm thirsty.",pron:"آيم ثيرستي",opts:["I'm thirsty.","I'm thirty.","I'm thirsty.","I'm thirdy."],c:0,cat:"Food"},
{ar:"عايز مية",en:"I want water.",pron:"آي وانت ووتر",opts:["I want water.","I want waiter.","I went water.","I want winter."],c:0,cat:"Food"},
{ar:"القهوة دي حلوة",en:"This coffee is good.",pron:"ذيس كوفي إز جود",opts:["This coffee is good.","This coffee is god.","This copy is good.","This coffee is go."],c:0,cat:"Food"},
{ar:"أنا رايح الشغل",en:"I'm going to work.",pron:"آيم جوينج تو ورك",opts:["I'm going to work.","I'm going to walk.","I'm going to wake.","I'm going to world."],c:0,cat:"Daily Activities"},
{ar:"الجو حلو النهارده",en:"The weather is nice today.",pron:"ذه ويذر إز نايس تودي",opts:["The weather is nice today.","The weather is nice to day.","The weather is nine today.","The weather is new today."],c:0,cat:"Daily Activities"},
{ar:"أنا بحب الإنجليزي",en:"I love English.",pron:"آي لاف إنقليزي",opts:["I love English.","I live English.","I left English.","I like English."],c:0,cat:"Daily Activities"},
{ar:"القلم بتاعي فين؟",en:"Where is my pen?",pron:"وير إز ماي بين؟",opts:["Where is my pen?","When is my pen?","What is my pen?","Who is my pen?"],c:0,cat:"Daily Activities"},
{ar:"أنا بدرس كل يوم",en:"I study every day.",pron:"آي ستادي إيفري داي",opts:["I study every day.","I study every day.","I start every day.","I stay every day."],c:0,cat:"Daily Activities"},
{ar:"إنت محتاج كام؟",en:"How much do you need?",pron:"هاو ماش دو يو نيد؟",opts:["How much do you need?","How much do you eat?","How much do you nest?","How much do you near?"],c:0,cat:"Shopping"},
{ar:"السعر كام؟",en:"How much is it?",pron:"هاو ماش إز إيت؟",opts:["How much is it?","How many is it?","How much are it?","How much is at?"],c:0,cat:"Shopping"},
{ar:"أنا عايز أشتري تليفون",en:"I want to buy a phone.",pron:"آي وانت تو باي فون",opts:["I want to buy a phone.","I want to buy a home.","I want to by a phone.","I want to buy a fun."],c:0,cat:"Shopping"},
{ar:"فيه خصم؟",en:"Is there a discount?",pron:"из ذير ديسكاونت؟",opts:["Is there a discount?","Is there a discount?","Is there a distant?","Is there a disk?"],c:0,cat:"Shopping"},
{ar:"أنا تعبان",en:"I feel sick.",pron:"آي فيل سك",opts:["I feel sick.","I feel sick.","I fell sick.","I feel six."],c:0,cat:"Health"},
{ar:"أنا رايح للدكتور",en:"I'm going to the doctor.",pron:"آيم جوينج تو ذه دوكتور",opts:["I'm going to the doctor.","I'm going to the daughter.","I'm going to the sector.","I'm going to the tractor."],c:0,cat:"Health"},
{ar:"محتاج دوا",en:"I need medicine.",pron:"آي نيد ميديسن",opts:["I need medicine.","I need media.","I need medium.","I need medal."],c:0,cat:"Health"},
{ar:"أنا مش فاهم",en:"I don't understand.",pron:"آي دونت أندرستاند",opts:["I don't understand.","I don't under stand.","I don't understand.","I don't under study."],c:0,cat:"Opinions"},
{ar:"أنا موافق",en:"I agree.",pron:"آي أجري",opts:["I agree.","I green.","I greet.","I great."],c:0,cat:"Opinions"},
{ar:"مش عايز",en:"I don't want it.",pron:"آي دونت وانت إيت",opts:["I don't want it.","I don't want eat.","I don't want is.","I don't want at."],c:0,cat:"Opinions"},
{ar:"أنا بحب الأكل ده",en:"I like this food.",pron:"آي لايك ذيس فود",opts:["I like this food.","I like this foot.","I like this good.","I like this wood."],c:0,cat:"Opinions"},
{ar:"الجو حر النهارده",en:"It's hot today.",pron:"إتس هوت تودي",opts:["It's hot today.","It's hat today.","It's hot to day.","It's hit today."],c:0,cat:"Weather"},
{ar:"الجو برد",en:"It's cold.",pron:"إتس كولد",opts:["It's cold.","It's gold.","It's cool.","It's could."],c:0,cat:"Weather"},
{ar:"مطر كتير",en:"It rains a lot.",pron:"إتس رينز لوت",opts:["It rains a lot.","It rains a lot.","It ran a lot.","It raise a lot."],c:0,cat:"Weather"},
{ar:"الشمس طالعة",en:"The sun is rising.",pron:"ذه سان إز رايزينج",opts:["The sun is rising.","The sun is rising.","The son is rising.","The sun is running."],c:0,cat:"Weather"},
{ar:"أنا عندي كلب",en:"I have a dog.",pron:"آي هاف دوج",opts:["I have a dog.","I have a cat.","I have a big.","I have a dug."],c:0,cat:"Family"},
{ar:"أخويا أكبر مني",en:"My brother is older than me.",pron:"ماي بذر إز أولدёр ذان مي",opts:["My brother is older than me.","My brother is over than me.","My brother is order than me.","My brother is older then me."],c:0,cat:"Family"},
{ar:"أنا ماشي",en:"I'm walking.",pron:"آيم ووكينج",opts:["I'm walking.","I'm working.","I'm waking.","I'm wanting."],c:0,cat:"Daily Activities"},
{ar:"الباب مفتوح",en:"The door is open.",pron:"ذه دور إز أوپن",opts:["The door is open.","The door is open.","The bore is open.","The door is up."],c:0,cat:"Daily Activities"},
{ar:"أنا بحب القراءة",en:"I love reading.",pron:"آي لاف ريدينج",opts:["I love reading.","I love riding.","I love ready.","I love reding."],c:0,cat:"Daily Activities"},
{ar:"ممكن تساعدني؟",en:"Can you help me?",pron:"كان يو هيلب مي؟",opts:["Can you help me?","Can you held me?","Can you helm me?","Can you hell me?"],c:0,cat:"Greetings"},
{ar:"فين الحمام؟",en:"Where is the bathroom?",pron:"وير إز ذه باذروم؟",opts:["Where is the bathroom?","Where is the bath room?","When is the bathroom?","What is the bathroom?"],c:0,cat:"Shopping"},
{ar:"أنا راجع البيت",en:"I'm coming home.",pron:"آيم كمنج هوم",opts:["I'm coming home.","I'm coming hole.","I'm coming him.","I'm coming here."],c:0,cat:"Daily Activities"},
{ar:"الوقت كام؟",en:"What time is it?",pron:"وات تايم إز إيت؟",opts:["What time is it?","What time is at?","What times is it?","What time are it?"],c:0,cat:"Daily Activities"},
{ar:"أنا بحبك",en:"I love you.",pron:"آي لاف يو",opts:["I love you.","I live you.","I left you.","I like you."],c:0,cat:"Family"},
{ar:"الكلام ده صح",en:"This is right.",pron:"ذيس إز رايت",opts:["This is right.","This is write.","This is light.","This is night."],c:0,cat:"Opinions"},
{ar:"أنا مش فاضي",en:"I'm not free.",pron:"آيم نوت فري",opts:["I'm not free.","I'm not four.","I'm not from.","I'm not five."],c:0,cat:"Opinions"},
{ar:"القهوة سخنة",en:"The coffee is hot.",pron:"ذه كوفي إز هوت",opts:["The coffee is hot.","The coffee is hat.","The coffee is hit.","The coffee is hut."],c:0,cat:"Food"},
{ar:"أنا ما أكلتش",en:"I didn't eat.",pron:"آي ديدنت إيت",opts:["I didn't eat.","I didn't it.","I did eat.","I don't eat."],c:0,cat:"Food"},
{ar:"هناك حد؟",en:"Is anyone there?",pron:"из إنوني ذير؟",opts:["Is anyone there?","Is any one three?","Is anyone their?","Is anyone then?"],c:0,cat:"Greetings"},
];

const FB_MEDIUM=[
{ar:"ممكن تكرر الكلام؟",en:"Can you repeat that?",pron:"كان يو ريبيت ذت؟",opts:["Can you repeat that?","Can you repeat this?","Can you repair that?","Can you report that?"],c:0,cat:"Travel"},
{ar:"أنا مسافر بكرة",en:"I'm traveling tomorrow.",pron:"آيم ترافلنج تو moro",opts:["I'm traveling tomorrow.","I'm traveling today.","I'm traveling tender.","I'm traveling to move."],c:0,cat:"Travel"},
{ar:"فين المطار؟",en:"Where is the airport?",pron:"وير إز ذه إيرپورت؟",opts:["Where is the airport?","Where is the report?","Where is the airport?","When is the airport?"],c:0,cat:"Travel"},
{ar:"أنا عايز أعمل ريزيرفشن",en:"I want to make a reservation.",pron:"آي وانت تو ميك ريزرفشن",opts:["I want to make a reservation.","I want to make a restaurant.","I want to make a resolution.","I want to make a relation."],c:0,cat:"Travel"},
{ar:"الفندق غالي",en:"The hotel is expensive.",pron:"ذه هوتيل إز إكسبنسيو",opts:["The hotel is expensive.","The hotel is experience.","The hotel is export.","The hotel is express."],c:0,cat:"Travel"},
{ar:"محتاج أدفع كام؟",en:"How much do I need to pay?",pron:"هاو ماش دو آي نيد تو باي؟",opts:["How much do I need to pay?","How much do I need to play?","How much do I need to pray?","How much do I need to stay?"],c:0,cat:"Shopping"},
{ar:"ممكن أشوف منتجات تانية؟",en:"Can I see other products?",pron:"كان آي سي أذر پرودكتس؟",opts:["Can I see other products?","Can I see over products?","Can I see mother products?","Can I see order products?"],c:0,cat:"Shopping"},
{ar:"فيه وصلالة ضريبية؟",en:"Is there a tax receipt?",pron:"из ذير تاكس ريسيت؟",opts:["Is there a tax receipt?","Is there a tax recite?","Is there a tax recent?","Is there a tax resort?"],c:0,cat:"Shopping"},
{ar:"الحالة بتاعتي مش كويسة",en:"I'm not feeling well.",pron:"آيم نوت فيلينج ويل",opts:["I'm not feeling well.","I'm not feeling will.","I'm not filling well.","I'm not feeling while."],c:0,cat:"Health"},
{ar:"أنا محتاج دكتور",en:"I need a doctor.",pron:"آي نيد دوكتور",opts:["I need a doctor.","I need a daughter.","I need a sector.","I need a tractor."],c:0,cat:"Health"},
{ar:"البروجكت اﺗأجل",en:"The project is postponed.",pron:"ذه پروجكت إز پوستپوند",opts:["The project is postponed.","The project is post point.","The project is past pond.","The project is best bond."],c:0,cat:"Work"},
{ar:"محتاج أعمل ريبورت",en:"I need to make a report.",pron:"آي نيد تو ميك ريبورت",opts:["I need to make a report.","I need to make a resort.","I need to make a record.","I need to make a result."],c:0,cat:"Work"},
{ar:"meeting بكرة الساعة 3",en:"Meeting tomorrow at 3.",pron:"ميتنج تو moro آت ثري",opts:["Meeting tomorrow at 3.","Meeting today at 3.","Meeting tender at 3.","Meeting to move at 3."],c:0,cat:"Work"},
{ar:"ممكن تبعتلي الإيمايل؟",en:"Can you send me the email?",pron:"كان يو سيند مي ذه إيميل؟",opts:["Can you send me the email?","Can you send me the email?","Can you sand me the email?","Can you sent me the email?"],c:0,cat:"Work"},
{ar:"الطقس حلو أوي النهارده",en:"The weather is very nice today.",pron:"ذه ويذر إز فيري نايس تودي",opts:["The weather is very nice today.","The weather is very nine today.","The weather is very new today.","The weather is vary nice today."],c:0,cat:"Weather"},
{ar:"هتمطر بكرة",en:"It will rain tomorrow.",pron:"إت ويل رين تو moro",opts:["It will rain tomorrow.","It will run tomorrow.","It will right tomorrow.","It will write tomorrow."],c:0,cat:"Weather"},
{ar:"أنا عندي رأي تاني",en:"I have another opinion.",pron:"آي هاف أذر أوبينيون",opts:["I have another opinion.","I have an other opinion.","I have another openion.","I have another opening."],c:0,cat:"Opinions"},
{ar:"الشغل ده صعب",en:"This work is hard.",pron:"ذيس ورك إز هارد",opts:["This work is hard.","This work is heart.","This work is heard.","This work is harm."],c:0,cat:"Work"},
{ar:"ممكن نأجل الموضوع؟",en:"Can we postpone the matter?",pron:"كان وي پوستپون ذه ماتر؟",opts:["Can we postpone the matter?","Can we post point the matter?","Can we post bone the matter?","Can we post pond the matter?"],c:0,cat:"Work"},
{ar:"أنا بحب أسافر",en:"I love traveling.",pron:"آي لاف ترافلنج",opts:["I love traveling.","I love training.","I love trying.","I love trading."],c:0,cat:"Travel"},
{ar:"ممكن تدلني على المطعم؟",en:"Can you direct me to the restaurant?",pron:"كان يو ديركت مي تو ذه ريستورانت؟",opts:["Can you direct me to the restaurant?","Can you detect me to the restaurant?","Can you direct me to the resort?","Can you direct me to the resident?"],c:0,cat:"Travel"},
{ar:"عايز أغير الفلوس",en:"I want to exchange money.",pron:"آي وانت تو إكستشينج موني",opts:["I want to exchange money.","I want to exit money.","I want to excuse money.","I want to expand money."],c:0,cat:"Travel"},
{ar:"البطاقة بتاعتي اﺗسرقت",en:"My card was stolen.",pron:"ماي كارد واز ستولن",opts:["My card was stolen.","My card was stone.","My card was stop.","My card was story."],c:0,cat:"Travel"},
{ar:"محتاج فاتورة",en:"I need a receipt.",pron:"آي نيد ريسيت",opts:["I need a receipt.","I need a recent.","I need a recite.","I need a record."],c:0,cat:"Shopping"},
{ar:"أنا مش لاقي الشارع ده",en:"I can't find this street.",pron:"آي كاونت فايند ذيس ستريت",opts:["I can't find this street.","I can't find this strict.","I can't find this stress.","I can't find this straight."],c:0,cat:"Travel"},
{ar:"الخدمة هنا مش كويسة",en:"The service here is not good.",pron:"ذه سيرفيس هير إز نوت جود",opts:["The service here is not good.","The service here is not gold.","The service here is not gone.","The service here is not god."],c:0,cat:"Opinions"},
{ar:"أنا محتاج أعمل update",en:"I need to do an update.",pron:"آي نيد تو دو أن أبديت",opts:["I need to do an update.","I need to do an upload.","I need to do an upgrade.","I need to do an upset."],c:0,cat:"Work"},
{ar:"ممكن تديني فرصة؟",en:"Can you give me a chance?",pron:"كان يو جيف مي تشارنس؟",opts:["Can you give me a chance?","Can you give me a change?","Can you give me a charge?","Can you give me a chart?"],c:0,cat:"Work"},
{ar:"الحاجة دي مش شغالة",en:"This thing is not working.",pron:"ذيس ثينج إز نوت وركينج",opts:["This thing is not working.","This thing is not waking.","This thing is not walking.","This thing is not wanting."],c:0,cat:"Work"},
{ar:"أنا بفكر أغير الشغل",en:"I'm thinking of changing jobs.",pron:"آيم ثينكينج أوف تشينجينج جوبز",opts:["I'm thinking of changing jobs.","I'm thinking of charging jobs.","I'm thinking of chasing jobs.","I'm thinking of checking jobs."],c:0,cat:"Work"},
{ar:"ممكن نتكلم شوية؟",en:"Can we talk a little?",pron:"كان وي توك ليتل؟",opts:["Can we talk a little?","Can we take a little?","Can we walk a little?","Can we work a little?"],c:0,cat:"Opinions"},
{ar:"أنا مش فاهم النقطة دي",en:"I don't understand this point.",pron:"آي دونت أندرستاند ذيس پوينت",opts:["I don't understand this point.","I don't understand this print.","I don't understand this paint.","I don't understand this plant."],c:0,cat:"Opinions"},
{ar:"الجو مش مستقر",en:"The weather is unstable.",pron:"ذه ويذر إز أنستيبل",opts:["The weather is unstable.","The weather is unable.","The weather is unable.","The weather is enjoyble."],c:0,cat:"Weather"},
{ar:"الشمس مش ظاهرة",en:"The sun is not showing.",pron:"ذه سان إز نوت شوينج",opts:["The sun is not showing.","The sun is not sewing.","The sun is not shoring.","The sun is not knowing."],c:0,cat:"Weather"},
{ar:"أنا رايح اتصور",en:"I'm going to take a photo.",pron:"آيم جوينج تو تيك فوتو",opts:["I'm going to take a photo.","I'm going to take a photo.","I'm going to take a fate.","I'm going to take a fun."],c:0,cat:"Daily Activities"},
{ar:"النت بتاعي بطيء",en:"My internet is slow.",pron:"ماي إنترنت إز سلو",opts:["My internet is slow.","My internet is snow.","My internet is show.","My internet is sole."],c:0,cat:"Daily Activities"},
{ar:"أنا لسه ماخلصتش",en:"I haven't finished yet.",pron:"آي هيفنت فينيشت يت",opts:["I haven't finished yet.","I haven't finish yet.","I haven't fined yet.","I haven't found yet."],c:0,cat:"Daily Activities"},
{ar:"ممكن تعمليللي كوباية شاي؟",en:"Can you make me a cup of tea?",pron:"كان يو ميك مي كب أف تي؟",opts:["Can you make me a cup of tea?","Can you make me a cap of tea?","Can you make me a cup of tie?","Can you make me a cut of tea?"],c:0,cat:"Food"},
{ar:"الأكل عايز تتبيل",en:"The food needs seasoning.",pron:"ذه فود نيدز سونينج",opts:["The food needs seasoning.","The food needs sewing.","The food needs seeing.","The food needs singing."],c:0,cat:"Food"},
{ar:"أنا مش بشرب سجاير",en:"I don't smoke.",pron:"آي دونت سموك",opts:["I don't smoke.","I don't small.","I don't smart.","I don't smell."],c:0,cat:"Health"},
{ar:"أنا بتمرن كل يوم",en:"I exercise every day.",pron:"آي إكسايسز إيفري داي",opts:["I exercise every day.","I exit every day.","I expect every day.","I export every day."],c:0,cat:"Health"},
{ar:"الدكتور قاللي أستريح",en:"The doctor told me to rest.",pron:"ذه دوكتور تولد مي تو رست",opts:["The doctor told me to rest.","The doctor told me to rust.","The doctor told me to rush.","The doctor told me to race."],c:0,cat:"Health"},
{ar:"أنا محتاج أغير حياتي",en:"I need to change my life.",pron:"آي نيد تو تشينج ماي لايف",opts:["I need to change my life.","I need to charge my life.","I need to chase my life.","I need to check my life."],c:0,cat:"Health"},
];

const FB_HARD=[
{ar:"الأفعال دي شاذة",en:"These verbs are irregular.",pron:"ذيز فربز أر إريجولر",opts:["These verbs are irregular.","These verbs are regular.","These verbs are popular.","These verbs are similar."],c:0,cat:"Grammar"},
{ar:"لما بتتكلم في الشغل لازم تكون رسمي",en:"When you speak at work, you must be formal.",pron:"ون يو سپيك آت ورك، يو ماست بي فورمل",opts:["When you speak at work, you must be formal.","When you speak at work, you must be normal.","When you speak at work, you must be final.","When you speak at work, you must be funny."],c:0,cat:"Formal English"},
{ar:"الشركة بتحقق أرباح كبيرة",en:"The company is making huge profits.",pron:"ذه كمپاني إز ميكينج هوج پروفتس",opts:["The company is making huge profits.","The company is making huge prophets.","The company is making huge products.","The company is making huge projects."],c:0,cat:"Business"},
{ar:"لازم تعمل بحث شامل",en:"You must conduct comprehensive research.",pron:"يو ماست كنداكت كمپريهنسيو ريسيرتش",opts:["You must conduct comprehensive research.","You must conduct comprehensive research.","You must conduct competitive research.","You must conduct complete research."],c:0,cat:"Academic"},
{ar:"الاقتصاد بيميل للاختصار",en:"The economy is leaning toward recession.",pron:"ذه أيكونومي إز لينينج تو وارد ريسيشن",opts:["The economy is leaning toward recession.","The economy is leaning toward recreation.","The economy is leaning toward reaction.","The economy is leaning toward rotation."],c:0,cat:"Business"},
{ar:"المatter ده معقد أوي",en:"This matter is very complicated.",pron:"ذيس ماتر إز فيري كمپليكيتيد",opts:["This matter is very complicated.","This matter is very calculated.","This matter is very cultivated.","This matter is very concentrated."],c:0,cat:"Formal English"},
{ar:"لازم تاخد بيرميشن قبل ما تدخل",en:"You must get permission before entering.",pron:"يو ماست جت پرمشن بيفور إنترنج",opts:["You must get permission before entering.","You must get position before entering.","You must get participation before entering.","You must get production before entering."],c:0,cat:"Formal English"},
{ar:"الساعةems بتبين إني مش مرتاح",en:"My body language shows I'm uncomfortable.",pron:"ماي بادي لينجج شوز آي أنكمفورتبل",opts:["My body language shows I'm uncomfortable.","My body language shows I'm comfortable.","My body language shows I'm considerable.","My body language shows I'm considerable."],c:0,cat:"Formal English"},
{ar:"لازم تعمل evaluation للبرنامج",en:"You must evaluate the program.",pron:"يو ماست إفالوبيت ذه پروجروم",opts:["You must evaluate the program.","You must evolve the program.","You must evaluate the progress.","You must evaluate the project."],c:0,cat:"Business"},
{ar:"فيه اختلاف في الـ perspective بتاعتنا",en:"There is a difference in our perspective.",pron:"ذر إز دفرنس إن أور پرسبكتفو",opts:["There is a difference in our perspective.","There is a difference in our perceptive.","There is a difference in our preventive.","There is a difference in our protective."],c:0,cat:"Academic"},
{ar:"لازم نعمل brainstorming لل pomysł ده",en:"We need to brainstorm this idea.",pron:"وي نيد تو برين ستورم ذيس آيديا",opts:["We need to brainstorm this idea.","We need to brain storm this idea.","We need to break storm this idea.","We need to brain stream this idea."],c:0,cat:"Business"},
{ar:"الـ deadline اقترب",en:"The deadline is approaching.",pron:"ذه ديدلاين إز أپروتشينج",opts:["The deadline is approaching.","The deadline is approving.","The deadline is attaching.","The deadline is attacking."],c:0,cat:"Business"},
{ar:"لازم ناخد الـ feedback بجدية",en:"We must take the feedback seriously.",pron:"وي ماست تيك ذه فيدبك سيريسلي",opts:["We must take the feedback seriously.","We must take the feedback seriously.","We must take the feedback separately.","We must take the feedback spiritually."],c:0,cat:"Business"},
{ar:"الاقتصاد العالمي فيه ركود",en:"The global economy is in recession.",pron:"ذه جلوبال أيكونومي إز إن ريسيشن",opts:["The global economy is in recession.","The global economy is in recreation.","The global economy is in rotation.","The global economy is in reaction."],c:0,cat:"Business"},
{ar:"لازم تعرف تتعامل مع الضغط",en:"You must know how to handle pressure.",pron:"يو ماست نو هاو تو هندل پريشر",opts:["You must know how to handle pressure.","You must know how to handle pleasure.","You must know how to handle practice.","You must know how to handle promise."],c:0,cat:"Formal English"},
{ar:"فيه تحديات كتير في الـ project ده",en:"There are many challenges in this project.",pron:"ذر أر ميني تشالينجز إن ذيس پروجكت",opts:["There are many challenges in this project.","There are many channels in this project.","There are many changes in this project.","There are many chapters in this project."],c:0,cat:"Business"},
{ar:"لازم نحسّن الـ workflow بتاعتنا",en:"We must improve our workflow.",pron:"وي ماست إمپروو أور ورك فلو",opts:["We must improve our workflow.","We must improve our word flow.","We must improve our work floor.","We must improve our worth flow."],c:0,cat:"Business"},
{ar:"العميل مش راضي عن الخدمة",en:"The client is not satisfied with the service.",pron:"ذه كلاينت إز نوت ساتيسفايد ويز ذه سيرفيس",opts:["The client is not satisfied with the service.","The client is not satisfied with the surface.","The client is not satisfied with the survey.","The client is not satisfied with the surplus."],c:0,cat:"Business"},
{ar:"لازم نعمل delegation للشغل",en:"We need to delegate the work.",pron:"وي نيد تو ديليقيت ذه ورك",opts:["We need to delegate the work.","We need to delete the work.","We need to delight the work.","We need to deliver the work."],c:0,cat:"Business"},
{ar:"الـ candidate ده مؤهل أوي",en:"This candidate is highly qualified.",pron:"ذيس كنديديت إز هايلي كواليفاييد",opts:["This candidate is highly qualified.","This candidate is highly quantified.","This candidate is highly quality fire.","This candidate is highly quiet."],c:0,cat:"Business"},
{ar:"لازم نعمل presentation للإدارة",en:"We must present to the management.",pron:"وي ماست پريزنت تو ذه مانيجمنت",opts:["We must present to the management.","We must present to the measurement.","We must present to the movement.","We must present to the monument."],c:0,cat:"Business"},
{ar:"لازم تاخد الـ initiative في الشغل",en:"You must take the initiative at work.",pron:"يو ماست تيك ذه إنيشياتيف آت ورك",opts:["You must take the initiative at work.","You must take the innovation at work.","You must take the limitation at work.","You must take the imagination at work."],c:0,cat:"Formal English"},
{ar:"الـ stakeholder مش مرتاح مع الـ decision",en:"The stakeholder is not comfortable with the decision.",pron:"ذه ستيك هولدر إز نوت كومفورتبل ويز ذه ديسيجن",opts:["The stakeholder is not comfortable with the decision.","The stakeholder is not considerable with the decision.","The stakeholder is not compatible with the decision.","The stakeholder is not confident with the decision."],c:0,cat:"Business"},
{ar:"لازم نعمل alignment على الـ goals",en:"We need to align on the goals.",pron:"وي نيد تو ألاين أون ذه جولز",opts:["We need to align on the goals.","We need to assign on the goals.","We need to allow on the goals.","We need to alarm on the goals."],c:0,cat:"Business"},
{ar:"فيه discrepancy في الأرقام",en:"There is a discrepancy in the numbers.",pron:"ذر إز ديسكريبنسي إن ذه نمبرز",opts:["There is a discrepancy in the numbers.","There is a discovery in the numbers.","There is a distraction in the numbers.","There is a discrimination in the numbers."],c:0,cat:"Academic"},
{ar:"لازم تعمل mitigation للمخاطر",en:"You must mitigate the risks.",pron:"يو ماست ميتيقيت ذه ريسكس",opts:["You must mitigate the risks.","You must motivate the risks.","You must mediate the risks.","You must moderate the risks."],c:0,cat:"Business"},
{ar:"فيه ambiguity في العقد",en:"There is ambiguity in the contract.",pron:"ذر إز أمبيجويتي إن ذه كونتراكت",opts:["There is ambiguity in the contract.","There is animation in the contract.","There is aggression in the contract.","There is autonomy in the contract."],c:0,cat:"Legal"},
{ar:"الـ leverage بتاعنا قوي في السوق",en:"Our leverage is strong in the market.",pron:"أور ليڤريج إز سترونج إن ذه ماركت",opts:["Our leverage is strong in the market.","Our language is strong in the market.","Our leisure is strong in the market.","Our linkage is strong in the market."],c:0,cat:"Business"},
{ar:"لازم نعمل compliance مع الـ regulations",en:"We must comply with the regulations.",pron:"وي مايت كمپلاي ويز ذه ريوجوليشنز",opts:["We must comply with the regulations.","We must complete with the regulations.","We must compete with the regulations.","We must compose with the regulations."],c:0,cat:"Legal"},
{ar:"الـ ROI مش مطابق للتوقعات",en:"The ROI does not match expectations.",pron:"ذه آر أو آي داز نوت ماتش إكسبكتيشنز",opts:["The ROI does not match expectations.","The ROI does not match experiments.","The ROI does not match explanations.","The ROI does not match extensions."],c:0,cat:"Business"},
{ar:"لازم تعمل extrapolation للبيانات",en:"You must extrapolate the data.",pron:"يو ماست إكسترابوليت ذه ديتا",opts:["You must extrapolate the data.","You must exaggerate the data.","You must evaluate the data.","You must elaborate the data."],c:0,cat:"Academic"},
{ar:"فيه discrepancy كبير في الـ analysis",en:"There is a major discrepancy in the analysis.",pron:"ذر إز ميجر ديسكريبنسي إن ذه أناليسيس",opts:["There is a major discrepancy in the analysis.","There is a major discovery in the analysis.","There is a major diversity in the analysis.","There is a major difficulty in the analysis."],c:0,cat:"Academic"},
{ar:"لازم تعمل Due diligence قبل الصفقة",en:"You must do due diligence before the deal.",pron:"يو ماست دو ديو ديليجنس بيفور ذه ديل",opts:["You must do due diligence before the deal.","You must do due reference before the deal.","You must do due difficulty before the deal.","You must do due difference before the deal."],c:0,cat:"Business"},
];

const FB_CS_EASY=[
{ar:"الكود شغال!",en:"It works!",pron:"إت وركس!",opts:["It works!","It walks!","It waits!","It wakes!"],c:0,cat:"Developer Phrases"},
{ar:"فيه bug في البرنامج",en:"There is a bug in the program.",pron:"ذر إز بق إن ذه پروجرام",opts:["There is a bug in the program.","There is a bag in the program.","There is a big in the program.","There is a bed in the program."],c:0,cat:"Error Messages"},
{ar:"احفظ الملف",en:"Save the file.",pron:"سيف ذه فايل",opts:["Save the file.","Save the pile.","Save the fail.","Save the fill."],c:0,cat:"Developer Phrases"},
{ar:"افتح الترمينال",en:"Open the terminal.",pron:"أوپن ذه تيرمينل",opts:["Open the terminal.","Open the terrible.","Open the terminal.","Open the turtle."],c:0,cat:"Linux Basics"},
{ar:"روّح على الـ directory",en:"Go to the directory.",pron:"جيو تو ذه ديركتوري",opts:["Go to the directory.","Go to the dictionary.","Go to the dirty.","Go to the doctor."],c:0,cat:"Linux Basics"},
{ar:"اعمل list للملفات",en:"List the files.",pron:"ليست ذه فايلز",opts:["List the files.","List the piles.","List the fills.","List the fails."],c:0,cat:"Linux Basics"},
{ar:"عمل commit للchanges",en:"Commit the changes.",pron:"كوميت ذه تشينجز",opts:["Commit the changes.","Comment the changes.","Commit the challenges.","Commit the chapters."],c:0,cat:"Git"},
{ar:"ارفع الكود على الـ remote",en:"Push the code to remote.",pron:"بوش ذه كود تو ريموت",opts:["Push the code to remote.","Push the code to remove.","Push the code to report.","Push the code to resort."],c:0,cat:"Git"},
{ar:"فيه syntax error",en:"There is a syntax error.",pron:"ذر إز سينتاكس إيرور",opts:["There is a syntax error.","There is a system error.","There is a synth error.","There is a single error."],c:0,cat:"Error Messages"},
{ar:"البرنامج وقع",en:"The program crashed.",pron:"ذه پروجرام كراشت",opts:["The program crashed.","The program crushed.","The program crossed.","The program closed."],c:0,cat:"Error Messages"},
{ar:"اعمل run للـ code",en:"Run the code.",pron:"ران ذه كود",opts:["Run the code.","Run the card.","Run the cold.","Run the cord."],c:0,cat:"Developer Phrases"},
{ar:"اعمل debug للبرنامج",en:"Debug the program.",pron:"ديبج ذه پروجرام",opts:["Debug the program.","Delay the program.","Delete the program.","Deploy the program."],c:0,cat:"Developer Phrases"},
{ar:"الملف موجود فين؟",en:"Where is the file?",pron:"وير إز ذه فايل؟",opts:["Where is the file?","Where is the pile?","Where is the fire?","Where is the mile?"],c:0,cat:"Linux Basics"},
{ar:"اعمل mkdir لفولدر جديد",en:"Create a new directory with mkdir.",pron:"كريت نيو ديركتوري ويز mkdir",opts:["Create a new directory with mkdir.","Create a new dictionary with mkdir.","Create a new dirty with mkdir.","Create a new doctor with mkdir."],c:0,cat:"Linux Basics"},
{ar:"permission denied",en:"Permission denied.",pron:"بيرميشن دينايد",opts:["Permission denied.","Position denied.","Permission defined.","Permission decided."],c:0,cat:"Error Messages"},
{ar:"الكود مش شغال عليا",en:"The code is not working for me.",pron:"ذه كود إز نوت وركنج فور مي",opts:["The code is not working for me.","The code is not walking for me.","The code is not waking for me.","The code is not waiting for me."],c:0,cat:"Developer Phrases"},
{ar:"اعمل copy للـ code",en:"Copy the code.",pron:"كوباي ذه كود",opts:["Copy the code.","Copy the card.","Copy the cold.","Copy the cord."],c:0,cat:"Developer Phrases"},
{ar:"الـ variable دي فاضية",en:"The variable is empty.",pron:"ذه فيريبل إز إمپتي",opts:["The variable is empty.","The variable is happy.","The variable is heavy.","The variable is hurry."],c:0,cat:"Code Basics"},
{ar:"اعمل reset للمتغيرات",en:"Reset the variables.",pron:"ريسيت ذه فيريبلز",opts:["Reset the variables.","Reset the variables.","Reset the valuable.","Reset the variety."],c:0,cat:"Code Basics"},
{ar:"الـ output غلط",en:"The output is wrong.",pron:"ذه أوتبوت إز رونج",opts:["The output is wrong.","The output is long.","The output is right.","The output is run."],c:0,cat:"Error Messages"},
];

const FB_CS_MEDIUM=[
{ar:"الكود محتاج compile",en:"The code needs to be compiled.",pron:"ذه كود نيدز تو بي كومبايلد",opts:["The code needs to be compiled.","The code needs to be completed.","The code needs to be collected.","The code needs to be corrected."],c:0,cat:"C/C++"},
{ar:"فيه memory leak في الـ program",en:"There is a memory leak in the program.",pron:"ذر إز ميموري ليك إن ذه پروجرام",opts:["There is a memory leak in the program.","There is a memory lake in the program.","There is a memory link in the program.","There is a memory late in the program."],c:0,cat:"C/C++"},
{ar:"الـ pointer مششير على حاجة فاضية",en:"The pointer is pointing to null.",pron:"ذه پوينتر إز پوينتينج تو نل",opts:["The pointer is pointing to null.","The pointer is printing to null.","The pointer is pulling to null.","The pointer is pausing to null."],c:0,cat:"C/C++"},
{ar:"اعمل pull request",en:"Make a pull request.",pron:"ميك پل ريكويست",opts:["Make a pull request.","Make a full request.","Make a poll request.","Make a push request."],c:0,cat:"GitHub Workflow"},
{ar:"الـ code review خلص",en:"The code review is done.",pron:"ذه كود ريفيو إز دان",opts:["The code review is done.","The code reveal is done.","The code revenge is done.","The code resort is done."],c:0,cat:"GitHub Workflow"},
{ar:"فيه exception في الـ code",en:"There is an exception in the code.",pron:"ذر إز إكسيبشن إن ذه كود",opts:["There is an exception in the code.","There is an execution in the code.","There is an exercise in the code.","There is an example in the code."],c:0,cat:"Python"},
{ar:"الـ function بترجع null",en:"The function returns null.",pron:"ذه فنكشن ريتورنز نل",opts:["The function returns null.","The function returns new.","The function returns net.","The function returns now."],c:0,cat:"C/C++"},
{ar:"اعمل merge للـ branch",en:"Merge the branch.",pron:"مرج ذه برانش",opts:["Merge the branch.","March the branch.","Match the branch.","Watch the branch."],c:0,cat:"GitHub Workflow"},
{ar:"الـ debugger مش شغال",en:"The debugger is not working.",pron:"ذه ديبيغر إز نوت وركنج",opts:["The debugger is not working.","The debugger is not waking.","The debugger is not walking.","The debugger is not waiting."],c:0,cat:"Debugging"},
{ar:"فيه infinite loop",en:"There is an infinite loop.",pron:"ذر إز إنفينيت لوب",opts:["There is an infinite loop.","There is an infinite loot.","There is an infinite lost.","There is an infinite love."],c:0,cat:"Debugging"},
{ar:"الـ deploy على الـ production خلص",en:"Deployment to production is complete.",pron:"دبلويمنت تو پروداكشن إز كمپليت",opts:["Deployment to production is complete.","Deployment to production is competitive.","Deployment to production is connected.","Deployment to production is computed."],c:0,cat:"GitHub Workflow"},
{ar:"الـ build فشل",en:"The build failed.",pron:"ذه بيلد فيلد",opts:["The build failed.","The build filed.","The build filled.","The build found."],c:0,cat:"Debugging"},
{ar:"اعمل commit message واضح",en:"Write a clear commit message.",pron:"رايت كليير كوميت ميسج",opts:["Write a clear commit message.","Write a close commit message.","Write a clever commit message.","Write a clean commit message."],c:0,cat:"GitHub Workflow"},
{ar:"الـ variable دي private",en:"This variable is private.",pron:"ذيس فيريبل إز پرايفت",opts:["This variable is private.","This variable is perfect.","This variable is pretty.","This variable is protected."],c:0,cat:"Python"},
{ar:"الكود محتاج refactor",en:"The code needs refactoring.",pron:"ذه كود نيدز ريفاكتورنج",opts:["The code needs refactoring.","The code needs rewriting.","The code needs reloading.","The code needs refreshing."],c:0,cat:"Debugging"},
{ar:"فيه مشكلة في الـ database",en:"There is a problem with the database.",pron:"ذر إز پروبلم ويز ذه ديتابيز",opts:["There is a problem with the database.","There is a problem with the date base.","There is a problem with the desk base.","There is a problem with the device."],c:0,cat:"Debugging"},
{ar:"اعمل test case للـ function",en:"Write a test case for the function.",pron:"رايت تيست كيس فور ذه فنكشن",opts:["Write a test case for the function.","Write a text case for the function.","Write a taste case for the function.","Write a task case for the function."],c:0,cat:"Debugging"},
{ar:"الـ API بترجع error",en:"The API is returning an error.",pron:"ذه إيه بي آي إز ريتورنينج أن إيرور",opts:["The API is returning an error.","The API is retiring an error.","The API is reviewing an error.","The API is returning an era."],c:0,cat:"Debugging"},
{ar:"الـ terminal مقفول",en:"The terminal is closed.",pron:"ذه تيرمينل إز كلوзд",opts:["The terminal is closed.","The terminal is clean.","The terminal is clear.","The terminal is clever."],c:0,cat:"Linux Basics"},
{ar:"اعمل chmod للملف",en:"Change permissions with chmod.",pron:"تشينج پرمشنز ويز chmod",opts:["Change permissions with chmod.","Change positions with chmod.","Change parents with chmod.","Change patterns with chmod."],c:0,cat:"Linux Basics"},
];

const FB_CS_HARD=[
{ar:"الـ gradient descent بيتناقص ببطء",en:"Gradient descent is decreasing slowly.",pron:"جراديينت ديسينت إز ديسريسينج سلولي",opts:["Gradient descent is decreasing slowly.","Gradient descent is describing slowly.","Gradient descent is displaying slowly.","Gradient descent is discovering slowly."],c:0,cat:"AI/ML"},
{ar:"الـ model overfitted على الـ training data",en:"The model is overfitted on training data.",pron:"ذه مودل إز أوفرفيتد أون تريننج ديتا",opts:["The model is overfitted on training data.","The model is overrated on training data.","The model is overfilled on training data.","The model is overpassed on training data."],c:0,cat:"AI/ML"},
{ar:"الـ mutex بيثبط الـ race conditions",en:"Mutex prevents race conditions.",pron:"ميوتكس بريفينتس ريس كونديشنز",opts:["Mutex prevents race conditions.","Mutex prevents rich conditions.","Mutex prevents right conditions.","Mutex prevents rate conditions."],c:0,cat:"Systems"},
{ar:"الـ time complexity بتاع الخوارزمية O(n log n)",en:"The algorithm has O(n log n) time complexity.",pron:"ذه ألgoritم هاز O(n log n) تايم كومبليكسيتي",opts:["The algorithm has O(n log n) time complexity.","The algorithm has O(n log n) type complexity.","The algorithm has O(n log n) tiny complexity.","The algorithm has O(n log n) total complexity."],c:0,cat:"Algorithms"},
{ar:"الـ backpropagation بتحسب الـ gradients",en:"Backpropagation computes gradients.",pron:"باك پروباجيشن كمپيوتس جرادينتس",opts:["Backpropagation computes gradients.","Backpropagation computes graphics.","Backpropagation computes greatings.","Backpropagation computes groupings."],c:0,cat:"AI/ML"},
{ar:"الـ container محتاج أكتر من الـ memory",en:"The container needs more memory than available.",pron:"ذه كونتينر نيدز مور ميموري ذان أفيلبل",opts:["The container needs more memory than available.","The container needs more memory than avoidable.","The container needs more memory than admirable.","The container needs more memory than affordable."],c:0,cat:"Architecture"},
{ar:"فيه deadlock في الـ threads",en:"There is a deadlock in the threads.",pron:"ذر إز ديدلوك إن ذه ثريدز",opts:["There is a deadlock in the threads.","There is a deadlock in the threats.","There is a dead lock in the threads.","There is a dead lock in the throws."],c:0,cat:"Systems"},
{ar:"الـ stack overflow بسبب recursion عميق",en:"Stack overflow caused by deep recursion.",pron:"stack أوفرلو كوزد باي ديب ريكرجن",opts:["Stack overflow caused by deep recursion.","Stack overflow caused by deep reaction.","Stack overflow caused by deep reduction.","Stack overflow caused by deep recognition."],c:0,cat:"Systems"},
{ar:"الـ Docker image محتاج أصغر حجم",en:"The Docker image needs to be smaller.",pron:"ذه دوكر إميج نيدز تو بي سمولر",opts:["The Docker image needs to be smaller.","The Docker image needs to be smarter.","The Docker image needs to be smoother.","The Docker image needs to be stronger."],c:0,cat:"Architecture"},
{ar:"الـ CI/CD pipeline بيعمل auto deploy",en:"The CI/CD pipeline auto-deploys.",pron:"ذه CI/CD بايبلاين أوتو دبليوز",opts:["The CI/CD pipeline auto-deploys.","The CI/CD pipeline auto-displays.","The CI/CD pipeline auto-describes.","The CI/CD pipeline auto-decides."],c:0,cat:"Architecture"},
{ar:"الـ SOLID principles مهمة جداً",en:"SOLID principles are very important.",pron:"سوليد پرينسپلز أر فيري إمپورنت",opts:["SOLID principles are very important.","SOLID principles are very imported.","SOLID principles are very improved.","SOLID principles are very impressed."],c:0,cat:"Architecture"},
{ar:"الـ hyperparameter tuning محتاج شغل كتير",en:"Hyperparameter tuning needs a lot of work.",pron:"هايبرپيراميتر تيونينج نيدز لوت أف ورك",opts:["Hyperparameter tuning needs a lot of work.","Hyperparameter tuning needs a lot of world.","Hyperparameter tuning needs a lot of word.","Hyperparameter tuning needs a lot of worth."],c:0,cat:"AI/ML"},
{ar:"الـ thread safety مش مضمون في الكود ده",en:"Thread safety is not guaranteed in this code.",pron:"ثريد سيفتي إز نوت غيرنتيد إن ذيس كود",opts:["Thread safety is not guaranteed in this code.","Thread safety is not granted in this code.","Thread safety is not guarded in this code.","Thread safety is not guessed in this code."],c:0,cat:"Systems"},
{ar:"الـ binary search أسرع من الـ linear search",en:"Binary search is faster than linear search.",pron:"باينري سيرتش إز فاستر ذان لينيئر سيرتش",opts:["Binary search is faster than linear search.","Binary search is faster than linear research.","Binary search is further than linear search.","Binary search is faster than linear reach."],c:0,cat:"Algorithms"},
{ar:"الـ dynamic programming بيحل المشاكل بذكاء",en:"Dynamic programming solves problems smartly.",pron:"ديناميك پروجرامينج سولفز پروبلمز سمارتلي",opts:["Dynamic programming solves problems smartly.","Dynamic programming solves problems slowly.","Dynamic programming solves problems simply.","Dynamic programming solves problems sadly."],c:0,cat:"Algorithms"},
{ar:"الـ neural network محتاج أكتر data",en:"The neural network needs more data.",pron:"ذه نيرال نيتورك نيدز مور ديتا",opts:["The neural network needs more data.","The neural network needs more dates.","The neural network needs more date.","The neural network needs more dead."],c:0,cat:"AI/ML"},
{ar:"الـ microservices architecture أفضل للـ scaling",en:"Microservices architecture is better for scaling.",pron:"مايكروسيرفيسيز أركيتكشر إز بتر فور سكيلينج",opts:["Microservices architecture is better for scaling.","Microservices architecture is better for schooling.","Microservices architecture is better for scanning.","Microservices architecture is better for scoring."],c:0,cat:"Architecture"},
{ar:"الـ divide and conquer strategy بتقسم المشكلة",en:"Divide and conquer strategy splits the problem.",pron:"ديفايد أند كنكوي ستراتيجي سپلتس ذه پروبلم",opts:["Divide and conquer strategy splits the problem.","Divide and conquer strategy splits the project.","Divide and conquer strategy splits the promise.","Divide and conquer strategy splits the process."],c:0,cat:"Algorithms"},
{ar:"الـ kernel بيمد الـ memory management",en:"The kernel handles memory management.",pron:"ذه كيرنل هندلز ميموري مانيجمنت",opts:["The kernel handles memory management.","The kernel handles memory manager.","The kernel handles memory market.","The kernel handles memory manner."],c:0,cat:"Systems"},
{ar:"الـ Kubernetes بي orchestrat الـ containers",en:"Kubernetes orchestrates containers.",pron:"كوبرنيتيس أركستريتس كونتينرز",opts:["Kubernetes orchestrates containers.","Kubernetes orchestrates contrasts.","Kubernetes orchestrates contractors.","Kubernetes orchestrates contributions."],c:0,cat:"Architecture"},
{ar:"الـ eventual consistency مش مناسب للحالة دي",en:"Eventual consistency is not suitable for this case.",pron:"إيفينتشوال كونسيستنسي إز نوت سويتبل فور ذيس كيس",opts:["Eventual consistency is not suitable for this case.","Eventual consistency is not sufficient for this case.","Eventual consistency is not sensitive for this case.","Eventual consistency is not selective for this case."],c:0,cat:"Architecture"},
{ar:"الـ sharding بيقسم الـ database على أكتر من سيرفر",en:"Sharding splits the database across multiple servers.",pron:"شاردنج سپلتس ذه ديتابيز أكروس ملتيبل سيرفرز",opts:["Sharding splits the database across multiple servers.","Sharding splits the database across multiple services.","Sharding splits the database across multiple surfaces.","Sharding splits the database across multiple surveys."],c:0,cat:"Architecture"},
{ar:"فيه circular dependency بين الـ modules",en:"There is a circular dependency between the modules.",pron:"ذر إز سركيوار ديبيندنسي بيتويذ ذه موديولز",opts:["There is a circular dependency between the modules.","There is a circular delivery between the modules.","There is a circular difficulty between the modules.","There is a circular diversity between the modules."],c:0,cat:"Systems"},
{ar:"الـ race condition حصل في الـ production",en:"A race condition occurred in production.",pron:"أ ريس كونديشن أكرد إن پروداكشن",opts:["A race condition occurred in production.","A rich condition occurred in production.","A right condition occurred in production.","A rare condition occurred in production."],c:0,cat:"Systems"},
{ar:"الـ load balancer بوزع الـ traffic بشكل عشوائي",en:"The load balancer distributes traffic randomly.",pron:"ذه لود بانسر دستريبيوتس ترافيك راندملي",opts:["The load balancer distributes traffic randomly.","The load balancer describes traffic randomly.","The load balancer disrupts traffic randomly.","The load balancer displays traffic randomly."],c:0,cat:"Architecture"},
{ar:"لازم تعمل pagination للـ results",en:"You must paginate the results.",pron:"يو ماست پيجينيت ذه ريزلتس",opts:["You must paginate the results.","You must motivate the results.","You must manipulate the results.","You must negotiate the results."],c:0,cat:"Debugging"},
{ar:"الـ serialization بتحوّل الـ objects لـ JSON",en:"Serialization converts objects to JSON.",pron:"سيريالايزيشن كونڤرتس أوبجكتس تو JSON",opts:["Serialization converts objects to JSON.","Serialization connects objects to JSON.","Serialization confuses objects to JSON.","Serialization collects objects to JSON."],c:0,cat:"Code Basics"},
{ar:"فيه memory leak بسبب الـ unclosed resources",en:"There is a memory leak due to unclosed resources.",pron:"ذر إز ميموري ليك ديو تو أنكلوزد ريسورسيز",opts:["There is a memory leak due to unclosed resources.","There is a memory leak due to unfinished resources.","There is a memory leak due to unlimited resources.","There is a memory leak due to uncertain resources."],c:0,cat:"Systems"},
{ar:"الـ async/await بيسهل الـ promise handling",en:"Async/await simplifies promise handling.",pron:"أسينك أو ويت سيمبلايفايز پرومس هاندلنج",opts:["Async/await simplifies promise handling.","Async/await signals promise handling.","Async/await supplies promise handling.","Async/await simulates promise handling."],c:0,cat:"Code Basics"},
{ar:"لازم تعمل index على الـ database query",en:"You must index the database query.",pron:"يو ماست إندكس ذه ديتابيز كويري",opts:["You must index the database query.","You must infix the database query.","You must impact the database query.","You must inform the database query."],c:0,cat:"Debugging"},
{ar:"الـ garbage collector بيقفل الـ memory",en:"The garbage collector frees memory.",pron:"ذه جاربيج كلكتور فريز ميموري",opts:["The garbage collector frees memory.","The garbage collector fills memory.","The garbage collector fears memory.","The garbage collector fights memory."],c:0,cat:"Systems"},
{ar:"فيه race condition في الـ shared state",en:"There is a race condition in the shared state.",pron:"ذر إز ريس كونديشن إن ذه شيرد ستيت",opts:["There is a race condition in the shared state.","There is a rich condition in the shared state.","There is a raw condition in the shared state.","There is a rare condition in the shared state."],c:0,cat:"Systems"},
{ar:"الـ idempotency مهمة في الـ API design",en:"Idempotency is important in API design.",pron:"أيدمپوتينسي إز إمپورنت إن API ديزاين",opts:["Idempotency is important in API design.","Identity is important in API design.","Impurity is important in API design.","Imprecision is important in API design."],c:0,cat:"Architecture"},
{ar:"لازم تعرف الفرق بين concurrency و parallelism",en:"You must know the difference between concurrency and parallelism.",pron:"يو ماست نو ذه دفرنس بيتويذ كيرينسي أند پاراليزم",opts:["You must know the difference between concurrency and parallelism.","You must know the difference between community and parallelism.","You must know the difference between curiosity and parallelism.","You must know the difference between conspiracy and parallelism."],c:0,cat:"Systems"},
];

function shuffleQOpts(q){
  const opts=[...q.opts];const correct=opts[q.c];
  for(let i=opts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]];}
  const newC=opts.indexOf(correct);
  return{...q,opts,c:newC};
}

function genLocalQs(isCS,difficulty){
  const bank=isCS?(difficulty==="Easy"?FB_CS_EASY:difficulty==="Medium"?FB_CS_MEDIUM:FB_CS_HARD):(difficulty==="Easy"?FB_EASY:difficulty==="Medium"?FB_MEDIUM:FB_HARD);
  const shuffled=[...bank].sort(()=>Math.random()-0.5);
  return shuffled.slice(0,50).map((q,i)=>{
    const sq=shuffleQOpts(q);
    const qt=i%7>=5?"p":i%7>=2?"w":"m";
    return{...sq,qt};
  });
}

async function genQs(day,ln,isCS=false){
  try{
    const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"gemini-2.0-flash",max_tokens:9000,messages:[{role:"user",content:`Generate exactly 50 English learning questions for Egyptian Arabic speakers. Level:${ln} Day:${day}/100. ${isCS?"CS/Programming":"General"} mode.\n${isCS?CS_TOPICS[ln]:TOPICS[ln]}\nOutput ONLY valid JSON array:\n[{"ar":"Arabic sentence","en":"English","pron":"نطق بالعربي","opts":["A","B","C","D"],"c":1,"cat":"Category"}]\nRules: c=0-3 index of correct; opts[c]=en exactly; 4 options; Egyptian dialect; distribute c evenly; exactly 50 items.`}]})});
    if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d.error||`API error ${res.status}`);}
    const d=await res.json();if(d.error)throw new Error(d.error);
    const content=d.content;const txt=Array.isArray(content)?content.map(b=>b.text||"").join(""):"";
    if(!txt)throw new Error("AI returned empty response");
    const s=txt.indexOf("["),e=txt.lastIndexOf("]");
    if(s<0||e<0)throw new Error("No JSON found in response");
    let raw;try{raw=JSON.parse(txt.slice(s,e+1));}catch{throw new Error("Failed to parse JSON");}if(!Array.isArray(raw)||raw.length<5)throw new Error("Too few questions");
    return raw.slice(0,50).map((q,i)=>{const c=typeof q.c==="number"&&q.c>=0&&q.c<=3?q.c:0;const opts=Array.isArray(q.opts)&&q.opts.length===4?q.opts.map(String):["A","B","C","D"];if(q.en&&opts[c]!==String(q.en))opts[c]=String(q.en);const sq=shuffleQOpts({ar:String(q.ar||"?"),en:String(q.en||"?"),pron:String(q.pron||""),opts,c,cat:String(q.cat||"General")});const qt=i%7>=5?"p":i%7>=2?"w":"m";return{...sq,qt};});
  }catch(e){
    console.warn("AI failed, using local question bank:",e.message);
    return genLocalQs(isCS,ln);
  }
}

const editDist=(a,b)=>{const m=a.length,n=b.length,dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i||j));for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);return dp[m][n];};
const checkAns=(inp,ans)=>{const a=ans.trim().toLowerCase(),t=inp.trim().toLowerCase();if(t===a)return"ok";if(editDist(t,a)<=Math.max(1,Math.floor(a.length*.15)))return"close";return"no";};
const mkHint=(ans,lv)=>{const ws=ans.split(" ");if(lv===1)return ws.map(w=>w[0]+"_".repeat(Math.max(0,w.length-1))).join(" ");return ws.map(w=>w.slice(0,Math.max(1,Math.ceil(w.length*.4)))+"_".repeat(Math.max(0,w.length-Math.max(1,Math.ceil(w.length*.4))))).join(" ");};

function useSnd(on){
  const ctx=useRef(null);
  return useCallback((t)=>{if(!on)return;try{if(!ctx.current)ctx.current=new(window.AudioContext||window.webkitAudioContext)();const ac=ctx.current;if(ac.state==="suspended")ac.resume();const now=ac.currentTime;const tone=(f,s,d,v=.22,w="sine")=>{const o=ac.createOscillator(),g=ac.createGain();o.type=w;o.frequency.value=f;g.gain.setValueAtTime(v,now+s);g.gain.exponentialRampToValueAtTime(.001,now+s+d);o.connect(g);g.connect(ac.destination);o.start(now+s);o.stop(now+s+d+.05);};if(t==="ok"){tone(523,0,.1);tone(659,.1,.1);tone(784,.18,.25);}else if(t==="close"){tone(440,0,.1);tone(523,.1,.18);}else if(t==="no"){tone(280,0,.08,.18,"sawtooth");tone(210,.09,.18,.18,"sawtooth");}else if(t==="hint"){tone(350,0,.07,.12);}else if(t==="nxt"){tone(440,0,.03,.1);tone(523,.04,.07,.08);}else if(t==="done"){tone(523,0,.1);tone(659,.12,.1);tone(784,.22,.1);tone(1047,.34,.3,.18);}else if(t==="stk"){tone(659,0,.08);tone(784,.08,.08);tone(1047,.16,.22);}else if(t==="flip"){tone(440,0,.05,.1);}}catch(e){};},[on]);
}

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700&display=swap');
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes sIn{from{transform:translateX(28px);opacity:0}to{transform:translateX(0);opacity:1}}
@keyframes fUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pop{0%{transform:scale(.84);opacity:0}65%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
@keyframes shk{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-7px)}40%,80%{transform:translateX(7px)}}
@keyframes glo{0%,100%{box-shadow:none}50%{box-shadow:0 0 24px rgba(34,197,94,.38)}}
@keyframes ptc{0%{transform:translateY(0)scale(1)rotate(0);opacity:1}100%{transform:translateY(-65px)scale(.1)rotate(220deg);opacity:0}}
@keyframes bce{0%,100%{transform:scale(1)}40%{transform:scale(1.25)}70%{transform:scale(.92)}}
@keyframes cUp{from{transform:translateY(5px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes pronIn{from{transform:translateY(-6px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes hnt{0%{background:transparent}50%{background:rgba(245,158,11,.2)}100%{background:transparent}}
@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes cardFlip{0%{transform:scale(1)}50%{transform:scale(.92)}100%{transform:scale(1)}}
@keyframes msgFade{0%{opacity:0;transform:translateY(8px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}
.qbtn{transition:transform .1s,background .15s,border-color .15s,box-shadow .15s}
.qbtn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 5px 18px rgba(0,0,0,.14)}
.qbtn:active:not(:disabled){transform:scale(.97)}
.ibtn{background:none;border:none;cursor:pointer;padding:5px 7px;border-radius:7px;transition:background .12s}
.ibtn:hover{background:rgba(128,128,128,.12)}
.inp:focus{outline:none;border-color:#3B82F6!important;box-shadow:0 0 0 3px rgba(59,130,246,.18)}
`;

function Ring({pct,fill,size=118}){const r=41,ci=2*Math.PI*r,off=ci*(1-Math.min(pct/100,1));return(<svg width={size} height={size} viewBox="0 0 100 100" style={{display:"block",margin:"0 auto"}}><circle cx="50" cy="50" r={r} fill="none" stroke="rgba(128,128,128,.14)" strokeWidth="9"/><circle cx="50" cy="50" r={r} fill="none" stroke={fill} strokeWidth="9" strokeDasharray={ci} strokeDashoffset={off} strokeLinecap="round" style={{transform:"rotate(-90deg)",transformOrigin:"50px 50px",transition:"stroke-dashoffset .7s"}}/><text x="50" y="46" textAnchor="middle" fill="currentColor" style={{fontSize:"14px",fontWeight:700}}>{Math.round(pct)}%</text><text x="50" y="59" textAnchor="middle" fill="rgba(128,128,128,.65)" style={{fontSize:"8px"}}>complete</text></svg>);}
function Hearts({n,max=5}){return(<div style={{display:"flex",gap:2}}>{Array.from({length:max},(_,i)=><span key={i} style={{fontSize:17,opacity:i<n?1:.18,transition:"opacity .3s"}}>❤️</span>)}</div>);}
function Ad({idx,T,sm}){const a=ADS[idx%ADS.length];return(<div style={{background:a.c+"0d",border:`1px solid ${a.c}22`,borderRadius:sm?8:10,padding:sm?"6px 12px":"10px 14px",display:"flex",alignItems:"center",gap:sm?8:12,marginBottom:sm?8:10}}>{sm?<span style={{fontSize:16}}>{a.ic}</span>:<div style={{width:36,height:36,borderRadius:9,background:a.c,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:19}}>{a.ic}</div>}<div style={{flex:1,minWidth:0}}><div style={{fontSize:sm?12:13,fontWeight:600,color:T.txt,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{a.t}</div><div style={{fontSize:sm?10:11,color:T.m}}>{a.s}</div></div><button style={{background:a.c,color:"#fff",border:"none",borderRadius:6,padding:sm?"3px 8px":"5px 12px",fontSize:12,cursor:"pointer",fontWeight:600,flexShrink:0}}>Free Trial</button><span style={{fontSize:9,color:T.m,flexShrink:0}}>Ad</span></div>);}
function Tog({v,fn,fill}){return(<button onClick={fn} style={{position:"relative",width:40,height:22,borderRadius:11,border:"none",cursor:"pointer",background:v?fill:"rgba(128,128,128,.28)",transition:"background .2s"}}><span style={{position:"absolute",top:3,left:v?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left .2s",display:"block",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/></button>);}
function Av({user,size=46,onClick}){return(<div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",background:user?.photo?"#000":avC(user?.name||"?"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.38,fontWeight:700,color:"#fff",flexShrink:0,cursor:onClick?"pointer":"default",overflow:"hidden",boxShadow:"0 2px 10px rgba(0,0,0,.15)"}}>{user?.photo?<img src={user.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:(user?.name||"?").charAt(0).toUpperCase()}</div>);}
function PronBox({pron,T,lv,en}){if(!pron)return null;return(<div style={{marginTop:10,padding:".6rem 1rem",borderRadius:8,background:lv.bg,border:`0.5px solid ${lv.br}`,animation:"pronIn .3s ease"}}><div style={{display:"flex",alignItems:"center",gap:8}}>
  {en&&<button onClick={(e)=>{e.stopPropagation();try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(en);u.lang="en-US";u.rate=0.85;u.pitch=1;window.speechSynthesis.speak(u);}catch(e){}}} style={{background:lv.fill,color:"#fff",border:"none",borderRadius:8,padding:"6px 10px",fontSize:16,cursor:"pointer",flexShrink:0}} title="Listen">🔊</button>}
  <div><div style={{fontSize:10,fontWeight:600,color:lv.tx,letterSpacing:".06em",textTransform:"uppercase",marginBottom:2}}>النطق بالعربي</div><div style={{direction:"rtl",fontSize:18,fontWeight:600,color:"var(--text-primary,#111)",fontFamily:"Cairo,sans-serif",lineHeight:1.6}}>{pron}</div></div></div></div>);}

const WORD_DICT={i:"أنا",you:"إنت",he:"هو",she:"هي",it:"هو(حاجة)",we:"إحنا",they:"هم",am:"(أنا)كون",is:"(هو/هي)كون",are:"(إنت/هم)كون",was:"(كان)كون(ماضي)",were:"(هم) كانوا",have:"عند(ي)",has:"عند(ه)",had:"كان عند(ه)",do:"يفعل",does:"(هو/هي)يفعل",did:"فعل",will:"هـ(مستقبل)",would:"(كان)هـ",can:"يقدر",could:"(كان)يقدر",may:"ممكن",might:"(ربما)",must:"لازم",should:"المفروض",shall:"(هـ-رسمي)",not:"مش",no:"لا",yes:"أه",and:"و",or:"أو",but:"بس",if:"لو",when:"لما",where:"فين",what:"إيه",who:"مين",why:"ليه",how:"إزاي",this:"ده",that:"ديك",these:"دول",those:"ديك(بعيد)",the:"(أداة تعريف)",a:"(أداة تنكير)",an:"(أداة تنكير)",my:"بتاعي",your:"بتاعك",his:"بتاعه",her:"بتاعها",its:"بتاعه(حاجة)",our:"بتاعنا",their:"بتاعهم",good:"كويس",bad:"وحش",big:"كبير",small:"صغير",new:"جديد",old:"قديم",hot:"سخن",cold:"بارد",fast:"سريع",slow:"بطيء",happy:"مبسوط",sad:"زعلان",eat:"ياكل",drink:"يشرب",go:"يروح",come:"يجي",see:"يشوف",look:"ينظر",give:"يدي",take:"ياخد",make:"يعمل",get:"يحصل",know:"يعرف",think:"يفكر",want:"يوريد",need:"محتاج",like:"يحب",love:"يحب(بشكل كبير)",buy:"يشتري",sell:"يبيع",pay:"يدفع",work:"يشتغل",play:"يلعب",run:"يركض",walk:"يمشي",sit:"يقعد",stand:"يقف",sleep:"ينام",wake:"يصحى",open:"يفتح",close:"يغلق",read:"يقرأ",write:"يكتب",speak:"يتكلم",listen:"يسمع",stop:"يقف",start:"يبدأ",finish:"يختم",help:"يساعد",try:"يحاول",use:"يستخدم",find:"يجد",tell:"يقول",ask:"يسأل",answer:"يجاوب",put:"يضع",keep:"يحتفظ",begin:"يبدأ",seem:"يبدو",feel:"يشعر",leave:"يمشي",call:"يتصل",turn:"يدور",move:"يتحرك",live:"يعيش",believe:"يصدق",bring:"يجيب",happen:"يحدث",include:"يشمل",provide:"يوفر",hold:"يمسك",follow:"يتبع",create:"يصنع",allow:"يسمح",add:"يضيف",spend:"يقضي(وقت)",grow:"يكبر",win:"يكسب",offer:"يعرض",remember:"يفتكر",consider:"يعتبر",appear:"يظهر",wait:"يستنى",serve:"يخدم",die:"يموت",send:"يرسل",expect:" يتوقع",build:"يبني",stay:"يقعد",fall:"يقع",cut:"يقطع",reach:"يوصل",kill:"يقتل",remain:"يفضل",suggest:"يقترح",raise:"يرفع",pass:"يعدي",require:"يحتاج",report:"يبلغ",decide:"يقرر",pull:"يسحب",develop:"يطور",meet:"يقابل",type:"يكتب(كيبورد)",connect:"يتصل",check:"يفحص",save:"يحفظ",change:"يغير",delete:"يحذف",install:"يثبت",download:"يحمل",upload:"يرفع",debug:"يصلح",fix:"يصلح",test:"يختبر",compile:"يكومبايل",deploy:"ينشر",push:"يرفع",merge:"يمزج",clone:"يكلون",commit:"يكوميت",branch:"يفرع",error:"غلط",bug:"خلل",code:"كود",function:"دالة",variable:"متغير",array:"مصفوفة",string:"نص",number:"رقم",object:"كائن",class:"فئة",method:"طريقة",property:"خاصية",return:"يرجع",else:"وإلا",while:"بينما",for:"لفترة",switch:"حالة",case:"حالة",break:"يوقف",continue:"يكمل",catch:"يلتقط",throw:"يرمي",import:"يستورد",export:"يصدّر",from:"من",const:"ثابت",let:"اترك",var:"متغير",true:"صح",false:"غلط",null:"فارغ",undefined:"غير محدد",void:"فارغ",typeof:"نوع",instanceof:"من نوع",in:"في",of:"من",with:"مع",async:"غير متزامن",await:"ينتظر",promise:"وعد",callback:"استدعاء",event:"حدث",listener:"مستمع",DOM:"مستند",node:"عقدة",element:"عنصر",tag:"وسم",attribute:"خاصية",value:"قيمة",key:"مفتاح",map:"خريطة",set:"مجموعة",weak:"ضعيف",strong:"قوي",public:"عام",private:"خاص",protected:"محفوظ",static:"ثابت",abstract:"تجريدي",interface:"واجهة",extends:"يمتد",implements:"ينفذ",super:"فوق",default:"افتراضي",as:"كـ",module:"وحدة",package:"حزمة",library:"مكتبة",framework:"إطار",runtime:"وقت التشغيل",compiler:"مترجم",interpreter:"مفسّر",debugger:" debugger",console:"وحدة التحكم",terminal:"طرفيّة",shell:"صدفة",browser:"متصفّح",server:"خادم",client:"عميل",database:"قاعدة بيانات",table:"جدول",query:"استعلام",index:"فهرس",column:"عمود",row:"صف",schema:"مخطط",migration:"ترحيل",seed:"بذرة",cache:"خزّنة",cookie:"كوكيز",session:"جلسة",token:"رمز",auth:"مصادقة",jwt:"رمز JWT",oauth:"OAuth",cors:"CORS",ssl:"SSL",tls:"TLS",http:"HTTP",https:"HTTPS",api:"واجهة برمجة",rest:"REST",graphql:"GraphQL",websocket:"وصلة ويب",socket:"مأخذ",port:"منفذ",host:"مضيف",domain:"نطاق",url:"رابط",uri:"معرّف",dns:"DNS",ip:"عنوان IP",tcp:"TCP",udp:"UDP",ssh:"SSH",ftp:"FTP",cdn:"CDN",aws:"AWS",azure:"Azure",gcp:"GCP",docker:"Docker",kubernetes:"كوبرنيتيس",ci:"CI",cd:"CD",pipeline:"خط أنابيب",lint:"فحص",format:"تنسيق",refactor:"إعادة هيكلة",monitor:"مراقبة",log:"سجل",metric:"قياس",alert:"تنبيه",scale:"قياس",load:"حمل",balance:"توازن",performance:"أداء",security:"أمان",privacy:"خصوصية",compliance:"امتثال",audit:"تدقيق",encrypt:"تشفير",decrypt:"فك تشفير",hash:"تجزئة",secret:"سر",certificate:"شهادة",firewall:"جدار حماية",intrusion:"اختراق",malware:"برمجيات خبيثة",vulnerability:"ثغرة",patch:"ترقية",update:"تحديث",upgrade:"ترقية",version:"إصدار",release:"إصدار",changelog:"سجل التغييرات",documentation:"توثيق",wiki:"ويكي",README:"README",license:"رخصة",copyright:"حقوق النشر",trademark:"علامة تجارية",patent:"براءة اختراع",warranty:"ضمان",liability:"مسؤولية",indemnify:"يعوض",arbitration:"تحكيم",jurisdiction:"اختصاص",governing:"يخضع",law:"قانون",regulation:"نظام",policy:"سياسة",terms:"شروط",gdpr:"GDPR",hipaa:"HIPAA",soc2:"SOC 2",iso27001:"ISO 27001",pci:"PCI",stripe:"Stripe",paypal:"PayPal",bitcoin:"بيتكوين",ethereum:"إيــريـــوم",blockchain:"سلسلة كتل",smart:"ذكي",contract:"عقد",wallet:"محفظة",mining:"تعدين",nonce:"nonce",block:"كتلة",chain:"سلسلة",peer:"نظير",consensus:"إجماع",fork:"فرع",mainnet:"الشبكة الرئيسية",testnet:"شبكة الاختبار",gas:"وقود",fee:"رسوم",transfer:"تحويل",address:"عنوان",recovery:"استرداد",backup:"نسخ احتياطي",sync:"مزامنة",offline:"غير متصل",online:"متصل",disconnect:"قطع",reconnect:"إعادة الاتصال",timeout:"مهلة",retry:"إعادة محاولة",fail:"فشل",success:"نجاح",warning:"تحذير",info:"معلومات",trace:"تتبع",level:"مستوى",channel:"قناة",topic:"موضوع",subscribe:"اشترك",publish:"نشر",broadcast:"بث",unicast:"بث أحادي",multicast:"بث متعدد",webhook:"webhook",endpoint:"نقطة نهاية",route:"مسار",header:"رأس",body:"جسم",status:"حالة",message:"رسالة",data:"بيانات",payload:"حمولة",param:"معامل",arg:"معامل",config:"إعدادات",env:"بيئة",role:"دور",permission:"صلاحية",access:"وصول",deny:"رفض",grant:"منح",revoke:"إلغاء",track:"تتبع",notify:"إشعار",email:"بريد",sms:"رسالة نصية",web:"ويب",mobile:"محمول",desktop:"مكتبي",user:"مستخدم",admin:"مدير",guest:"ضيف",member:"عضو",owner:"مالك",creator:"منشئ",manager:"مدير",developer:"مطور",designer:"مصمم",tester:"مختبر",analyst:"محلل",architect:"مهندس معماري",lead:"قائد",senior:"كبير",junior:"صغير",intern:"تدريبي",freelance:"حر",contractor:"مقاول",vendor:"بائع",supplier:"مورّد",partner:"شريك",affiliate:"تابع",reseller:"معيد بيع",distributor:"موزّع",customer:"عميل",audience:"جمهور",visitor:"زائر",subscriber:"مشترك",follower:"متابع",fan:"معجب",critic:"ناقد",reviewer:"مراجع",reporter:"مراسل",journalist:"صحفي",editor:"محرر",publisher:"ناشر",blogger:"مدوّن",influencer:"مؤثّر",celebrity:"مشهور",star:"نجم",idol:"أيقونة",legend:"أسطورة",genius:"عبقري",expert:"خبير",master:"سيد",pro:"محترف",amateur:"هاوي",beginner:"مبتدئ",novice:"متوحد",intermediate:"متوسط",advanced:"متقدم",guru:"गुरु",sensei:"sensei",maestro:"maestro",virtuoso:"virtuoso",champion:"بطل",winner:"فاتح",loser:"خاسر",rival:"منافس",opponent:"خصم",ally:"حليف",friend:"صديق",enemy:"عدو",buddy:"رفيق",pal:"صاحب",mate:"صاحب",companion:"رفيق",colleague:"زميل",associate:"مساعد",superior:"رئيس",subordinate:"مرؤوس",boss:"رئيس",employee:"موظف",worker:"عامل",staff:"موظفين",team:"فريق",group:"مجموعة",organization:"منظمة",company:"شركة",corporation:"شركة",enterprise:"شركة",business:"شركة",startup:"شركة ناشئة",firm:"مكتب",agency:"وكالة",bureau:"مكتب",institution:"مؤسسة",foundation:"مؤسسة",association:"جمعية",union:"اتحاد",committee:"لجنة",board:"مجلس",council:"مجلس",parliament:"برلمان",congress:"كونغرس",senate:"مجلس شيوخ",government:"حكومة",state:"دولة",country:"دولة",nation:"أمة",republic:"جمهورية",democracy:"ديمقراطية",dictatorship:"دكتاتورية",monarchy:"ملكية",empire:"إمبراطورية",kingdom:"مملكة",colony:"مستعمرة",territory:"إقليم",province:"مقاطعة",county:"مقاطعة",city:"مدينة",town:"بلدة",village:"قرية",neighborhood:"حي",district:"منطقة",region:"منطقة",zone:"منطقة",area:"منطقة",place:"مكان",location:"موقع",position:"موضع",coordinates:"إحداثيات",latitude:"خط العرض",longitude:"خط الطول",altitude:"ارتفاع",elevation:"ارتفاع",depth:"عمق",distance:"مسافة",range:"مدى",size:"حجم",volume:"حجم",capacity:"سعة",mass:"كتلة",weight:"وزن",density:"كثافة",temperature:"درجة حرارة",pressure:"ضغط",humidity:"رطوبة",wind:"رياح",rain:"مطر",snow:"ثلج",sun:"شمس",moon:"قمر",planet:"كوكب",earth:"أرض",mars:"المريخ",jupiter:"المشترى",saturn:"زحل",venus:"الزهرة",mercury:"عطارد",uranus:"أورانوس",neptune:"نبتون",pluto:"بلوتو",galaxy:"مجرة",universe:"كون",space:"فضاء",time:"وقت",past:"ماضي",present:"حاضر",future:"مستقبل",year:"سنة",month:"شهر",week:"أسبوع",day:"يوم",hour:"ساعة",minute:"دقيقة",second:"ثانية",millisecond:"ميلي ثانية",microsecond:"ميكرو ثانية",nanosecond:"نانو ثانية",century:"قرن",decade:"عقد",millennium:"ألف سنة",era:"عصر",epoch:"حقبة",moment:"لحظة",instant:"لحظة",duration:"مدة",period:"فترة",interval:"فاصل",schedule:"جدولة",deadline:"موعد نهائي",milestone:"معلم",checkpoint:"نقطة تحقق",phase:"مرحلة",stage:"مرحلة",step:"خطوة",grade:"درجة",rank:"مرتبة",condition:"حالة",situation:"وضع",circumstance:"ظروف",incident:"حادثة",accident:"حادث",emergency:"طوارئ",crisis:"أزمة",disastor:"كارثة",catastrophe:"كارثة",tragedy:"مأساة",disaster:"كارثة",calamity:"كارثة",panic:"ذعر",fear:"خوف",anxiety:"قلق",stress:"توتر",tension:"توتر",burden:"عبء",responsibility:"مسؤولية",duty:"واجب",obligation:"التزام",commitment:"التزام",agreement:"اتفاق",treaty:"معاهدة",pact:"معاهد",alliance:"تحالف",coalition:"تحالف",partnership:"شراكة",collaboration:"تعاون",cooperation:"تعاون",teamwork:"عمل جماعي",synergy:"تناغم",integration:"تكامل",unification:"توحيد",consolidation:"تثبيت",merger:"اندماج",acquisition:"استحواذ",takeover:"استحواذ",buyout:"شراء",sale:"بيع",purchase:"شراء",transaction:"معاملة",deal:"صفقة",bargain:"مساومة",discount:"خصم",refund:"استرداد",exchange:"ambio",guarantee:"كفالة",insurance:"تأمين",coverage:"تغطية",premium:"قسط",deductible:"مبلغ م.cms",claim:"مطالبة",settlement:"تسوية",litigation:"دعاوى",lawsuit:"دعاوى",court:"محكمة",judge:"قاضي",jury:"هيئة المحلفين",witness:"شاهد",evidence:"دليل",proof:"برهان",testimony:"شهادة",verdict:"حكم",sentence:"حكم",penalty:"عقوبة",fine:"غرامة",imprisonment:"سجن",probation:"إشراف",parole:"إفراج مشروط",pardon:"عفو",amnesty:"عفو عام",reprieve:"تأجيل",appeal:"استئناف",review:"مراجعة",reconsideration:"إعادة النظر",amendment:"تعديل",revision:"مراجعة",improvement:"تحسين",enhancement:"تحسين",optimization:"تحسين",refactoring:"إعادة هيكلة",reorganization:"إعادة تنظيم",restructuring:"إعادة هيكلة",reform:"إصلاح",revolution:"ثورة",evolution:"تطور",progress:"تقدم",advancement:"تقدم",development:"تطوير",growth:"نمو",expansion:"توسع",extension:"امتداد",prolongation:"إطالة",continuation:"استمرار",sustainability:"استدامة",resilience:"مرونة",adaptability:"قدرة التكيّف",flexibility:"مرونة",versatility:"تنوع",diversity:"تنوّع",variety:"نوعية",scope:"نطاق",extent:"مدى",degree:"درجة",intensity:"شدة",magnitude:"حجم",proportion:"نسبة",ratio:"نسبة",percentage:"نسبة مئوية",fraction:"كسر",decimal:"عشري",integer:"عدد صحيح",digit:"رقم",zero:"صفر",one:"واحد",two:"اثنين",three:"ثلاثة",four:"أربعة",five:"خمسة",six:"ستة",seven:"سبعة",eight:"ثمانية",nine:"تسعة",ten:"عشرة",hundred:"مئة",thousand:"ألف",million:"مليون",billion:"مليار",trillion:"تريليون",quadrillion:"كوادريليون"};
function speakEn(text){try{window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="en-US";u.rate=0.82;u.pitch=1;window.speechSynthesis.speak(u);}catch(e){}}
function WordTrans({text,T:Th,lv}){
  const [open,setOpen]=useState(null);
  if(!text)return null;
  const words=text.split(/\s+/);
  return(<div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center",alignItems:"center"}}>
    {words.map((w,i)=>{
      const clean=w.replace(/[^a-zA-Z'-]/g,"");
      const trans=WORD_DICT[clean.toLowerCase()];
      const isOpen=open===i;
      return(
        <span key={i} style={{position:"relative",display:"inline-block"}}>
          <span onClick={(e)=>{e.stopPropagation();setOpen(isOpen?null:i);}} style={{padding:"3px 6px",borderRadius:6,cursor:"pointer",fontSize:16,fontWeight:600,color:lv?lv.tx:"#2563EB",background:isOpen?(lv?lv.bg:"rgba(59,130,246,.12)"):"transparent",border:trans?`1px dashed ${lv?lv.br:"rgba(59,130,246,.3)"}`:"1px solid transparent",transition:"all .15s",userSelect:"none"}}>{w} </span>
          {isOpen&&trans&&<span style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",background:"#1E293B",color:"#fff",padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:600,whiteSpace:"nowrap",zIndex:50,boxShadow:"0 4px 12px rgba(0,0,0,.25)",fontFamily:"Cairo,sans-serif",animation:"pop .15s ease"}}>{trans}</span>}
          {isOpen&&!trans&&<span style={{position:"absolute",bottom:"100%",left:"50%",transform:"translateX(-50%)",background:"#1E293B",color:"#94A3B8",padding:"4px 10px",borderRadius:8,fontSize:11,whiteSpace:"nowrap",zIndex:50,boxShadow:"0 4px 12px rgba(0,0,0,.25)"}}>—</span>}
        </span>
      );
    })}
    <button onClick={()=>speakEn(text)} style={{background:lv?lv.fill:"#3B82F6",color:"#fff",border:"none",borderRadius:8,padding:"4px 8px",fontSize:14,cursor:"pointer",flexShrink:0,marginLeft:4}} title="Listen">🔊</button>
  </div>);
}

function GenScreen({prog,lv,T,gs,isCS}){
  const [tick,setTick]=useState(0);const [msgIdx,setMsgIdx]=useState(0);
  const msgs=isCS?["بنحمّل مصطلحات البرمجة...","Please be patient, loading CS phrases...","Generating programming English with AI...","بنجهز أسئلة C++ وLinux...","Loading developer vocabulary...","هنبدأ بعد شوية! 💻"]:["Please be patient, we are loading...","Almost there! AI is thinking...","Crafting your Egyptian Arabic phrases...","بنجهز الأسئلة...","Just a few more seconds! ☕","هنبدأ بعد شوية! 🚀"];
  const chars=isCS?["C","++","{}","[]","AI","ML","py","js","//",">_","ls","git","λ","0x","fn","=>","var","int"]:["A","أ","B","ب","C","ت","D","ث","E","ج","F","ح","G","خ","H","د"];
  const N=12,R=88;
  useEffect(()=>{const t=setInterval(()=>setTick(x=>x+1),80);return()=>clearInterval(t);},[]);
  useEffect(()=>{const t=setInterval(()=>setMsgIdx(x=>(x+1)%msgs.length),2200);return()=>clearInterval(t);},[]);
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:T.root,padding:"2rem",textAlign:"center"}}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}@keyframes msgFade{0%{opacity:0;transform:translateY(8px)}15%{opacity:1;transform:translateY(0)}85%{opacity:1}100%{opacity:0;transform:translateY(-8px)}}@keyframes bce{0%,100%{transform:scale(1)}40%{transform:scale(1.25)}70%{transform:scale(.92)}}`}</style>
    <div style={{position:"relative",width:210,height:210,marginBottom:28}}>
      {Array.from({length:N},(_,i)=>{const angle=(i/N)*360+(tick*2.8),rad=angle*Math.PI/180,x=105+R*Math.cos(rad)-16,y=105+R*Math.sin(rad)-14;const p2=(i/N+tick*.012)%1,sc=0.7+p2*0.6,al=0.25+p2*0.75,ch=chars[i%chars.length],isAr=/[\u0600-\u06FF]/.test(ch);return(<div key={i} style={{position:"absolute",left:x,top:y,minWidth:28,height:28,borderRadius:7,background:lv.fill,opacity:al,transform:`scale(${sc})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isCS?10:13,fontWeight:700,color:"#fff",fontFamily:isAr?"Cairo,sans-serif":"monospace",boxShadow:`0 0 8px ${lv.fill}66`,padding:"0 4px"}}>{ch}</div>);})}
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:88,height:88,borderRadius:"50%",background:lv.bg,border:`3px solid ${lv.br}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:3}}><div style={{fontSize:isCS?22:26}}>{isCS?"💻":"🎓"}</div><div style={{fontSize:9,fontWeight:700,color:lv.tx}}>{isCS?"CS":"DAY"} {prog.day}</div></div>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:106,height:106,borderRadius:"50%",border:`2px dashed ${lv.fill}44`,animation:"spin 8s linear infinite"}}/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:128,height:128,borderRadius:"50%",border:`1.5px solid ${lv.fill}22`,animation:"spin 12s linear infinite reverse"}}/>
    </div>
    <div style={{height:28,marginBottom:10,overflow:"hidden",position:"relative",width:"100%",maxWidth:340}}>
      <p key={msgIdx} style={{fontSize:14,fontWeight:600,color:T.txt,margin:0,animation:"msgFade 2.2s ease",position:"absolute",width:"100%",left:0,fontFamily:"Cairo,sans-serif"}}>{msgs[msgIdx]}</p>
    </div>
    <p style={{fontSize:12,color:T.m,marginBottom:18}}>{gs===0?"Checking saved questions...":"Generating phrases with AI..."}</p>
    <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:22}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:lv.fill,opacity:.7,animation:`bce 1.4s ease ${i*.22}s infinite`}}/>)}</div>
    <div style={{background:T.s2,border:`0.5px solid ${T.bd}`,borderRadius:12,padding:"12px 18px",maxWidth:300,animation:"fUp .4s ease .2s both"}}><p style={{fontSize:11,color:T.m,margin:0,lineHeight:1.6}}>{isCS?"💡 كل سؤال فيه النطق الإنجليزي بالعربي — زي \"جيت كوميت\" لـ git commit":"💡 كل سؤال فيه كيفية نطق الإنجليزي بالعربي — زي \"هاو أر يو؟\""}</p></div>
  </div>);}

function ProfileView({username,T,K,dark,onBack}){
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!username)return;
    setLoading(true);setData(null);
    fetch(`/api/profile/${username}`)
      .then(r=>r.json()).then(d=>{setData(d.profile||null);setLoading(false);})
      .catch(()=>{setLoading(false);});
  },[username]);
  if(loading)return(<div style={{textAlign:"center",padding:40}}><div style={{width:32,height:32,border:`3px solid ${T.bd}`,borderTopColor:"#3B82F6",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 12px"}}/><p style={{color:T.m,fontSize:13}}>جاري تحميل الملف الشخصي...</p></div>);
  if(!data)return(<div style={{...K(),textAlign:"center",padding:40}}><div style={{fontSize:48,marginBottom:12}}>😕</div><p style={{color:T.m}}>المستخدم غير موجود</p></div>);
  const pLv=getLv(data.totalXP||0);
  const acc=data.totalAnswered>0?Math.round(data.totalCorrect/data.totalAnswered*100):0;
  return(
    <div style={{animation:"fUp .3s ease"}}>
      <div style={{...K(),textAlign:"center",marginBottom:14}}>
        <div style={{width:80,height:80,borderRadius:"50%",background:data.photo?"#000":`linear-gradient(135deg,${pLv.c},${pLv.c}88)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:32,fontWeight:700,color:"#fff",overflow:"hidden",boxShadow:`0 4px 20px ${pLv.c}30`}}>
          {data.photo?<img src={data.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:(data.name||"?").charAt(0)}
        </div>
        <div style={{fontSize:20,fontWeight:700,color:T.txt}}>{data.name}</div>
        {data.username&&<div style={{fontSize:14,color:LC.Easy.tx,marginTop:3}}>@{data.username}</div>}
        <div style={{display:"inline-flex",alignItems:"center",gap:6,background:pLv.bg,border:`1px solid ${pLv.br}`,color:pLv.tx,padding:"3px 10px",borderRadius:20,fontSize:12,fontWeight:700,marginTop:8}}>{pLv.i} {pLv.n}</div>
        {data.joinedAt&&<div style={{fontSize:11,color:T.m,marginTop:8}}>📅 انضم في {new Date(data.joinedAt).toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"})}</div>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{v:`${(data.totalXP||0).toLocaleString()}`,l:"Total XP",c:"#F59E0B"},{v:`🔥 ${data.currentStreak||0}`,l:"Streak"},{v:`${acc}%`,l:"Accuracy"},{v:data.bestStreak||0,l:"Best streak"}].map((s,i)=>(
          <div key={i} style={{...K(),textAlign:"center",marginBottom:0}}><div style={{fontSize:17,fontWeight:700,color:s.c||T.txt}}>{s.v}</div><div style={{fontSize:11,color:T.m,marginTop:2}}>{s.l}</div></div>
        ))}
      </div>
      {(data.general||data.cs)&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
        {data.general&&<div style={{...K(),marginBottom:0}}>
          <div style={{fontSize:12,fontWeight:700,color:T.txt,marginBottom:6}}>🗣️ General</div>
          <div style={{fontSize:11,color:T.m,lineHeight:1.8}}>
            XP: <b style={{color:"#F59E0B"}}>{data.general.xp||0}</b><br/>
            ✓ {data.general.correct||0} / {data.general.answered||0}
          </div>
        </div>}
        {data.cs&&<div style={{...K(),marginBottom:0}}>
          <div style={{fontSize:12,fontWeight:700,color:T.txt,marginBottom:6}}>💻 CS</div>
          <div style={{fontSize:11,color:T.m,lineHeight:1.8}}>
            XP: <b style={{color:"#F59E0B"}}>{data.cs.xp||0}</b><br/>
            ✓ {data.cs.correct||0} / {data.cs.answered||0}
          </div>
        </div>}
      </div>}
    </div>
  );
}

export default function App(){
  const getRoute=()=>{const h=window.location.hash.replace("#","").replace("/","");if(h==="desktop")return"desktop";if(h==="app")return"app";if(h.startsWith("@"))return"profile";return"landing";};
  const getRouteProfile=()=>{const h=window.location.hash.replace("#","").replace("/","");return h.startsWith("@")?h.slice(1):null;};
  const [route,setRoute]=useState(getRoute);
  const [routeProfile,setRouteProfile]=useState(getRouteProfile);
  useEffect(()=>{const h=()=>{setRoute(getRoute());setRouteProfile(getRouteProfile());};window.addEventListener("hashchange",h);return()=>window.removeEventListener("hashchange",h);},[]);

  const [view,setView]=useState("loading");
  const [prog,setProg]=useState({...DEF});
  const [csProg,setCsProg]=useState({...DEF});
  const [qs,setQs]=useState([]);
  const [qi,setQi]=useState(0);
  const [sel,setSel]=useState(null);
  const [inp,setInp]=useState("");
  const [res,setRes]=useState(null);
  const [hl,setHl]=useState(0);
  const [showA,setShowA]=useState(false);
  const [tries,setTries]=useState(0);
  const [ok,setOk]=useState(0);
  const [sXp,setSXp]=useState(0);
  const [hrt,setHrt]=useState(5);
  const [cStreak,setCStreak]=useState(0);
  const [fOk,setFOk]=useState(0);
  const [fXp,setFXp]=useState(0);
  const [ptcl,setPtcl]=useState(false);
  const [shkIdx,setShkIdx]=useState(null);
  const [xpPop,setXpPop]=useState(null);
  const [stkPop,setStkPop]=useState(null);
  const [wrongQs,setWrongQs]=useState([]);
  const [showWrong,setShowWrong]=useState(false);
  const [exitConfirm,setExitConfirm]=useState(false);
  const [studyIdx,setStudyIdx]=useState(0);
  const [studyFlipped,setStudyFlipped]=useState(false);
  const [dark,setDark]=useState(false);
  const [snd,setSnd]=useState(true);
  const [viewMode,setViewMode]=useState(()=>{try{return localStorage.getItem("e5k_viewMode")||(window.innerWidth>=1024?"desktop":"mobile");}catch{return window.innerWidth>=1024?"desktop":"mobile";}});
  const [gs,setGs]=useState(0);
  const [errMsg,setErrMsg]=useState("");
  const [user,setUser]=useState(null);
  const [showCfg,setShowCfg]=useState(false);
  const [qKey,setQKey]=useState(0);
  const [practice,setPractice]=useState(false);
  const [isCS,setIsCS]=useState(false);
  const [profView,setProfView]=useState(false);
  const [rst,setRst]=useState(false);
  const [sName,setSName]=useState("");
  const [sAge,setSAge]=useState("");
  const [sEmail,setSEmail]=useState("");
  const [authToken,setAuthToken]=useState(null);
  const [authView,setAuthView]=useState("");
  const [authEmail,setAuthEmail]=useState("");
  const [authPass,setAuthPass]=useState("");
  const [authName,setAuthName]=useState("");
  const [authUsername,setAuthUsername]=useState("");
  const [authAge,setAuthAge]=useState("");
  const [authErr,setAuthErr]=useState("");
  const [authMsg,setAuthMsg]=useState("");
  const [authLoading,setAuthLoading]=useState(false);
  const [syncing,setSyncing]=useState(false);
  const [cloudConnected,setCloudConnected]=useState(false);
  const [gramTopic,setGramTopic]=useState(null);
  const [gramSection,setGramSection]=useState(0);
  const [puzzleChips,setPuzzleChips]=useState([]);
  const [puzzleAnswer,setPuzzleAnswer]=useState([]);
  const [puzzleDone,setPuzzleDone]=useState(false);
  const [puzzleOk,setPuzzleOk]=useState(false);
  const [leaderboard,setLeaderboard]=useState([]);
  const [leaderboardRank,setLeaderboardRank]=useState(null);
  const [leaderboardLoading,setLeaderboardLoading]=useState(false);
  const topAd=useRef(Math.floor(Math.random()*4));
  const botAd=useRef((Math.floor(Math.random()*4)+2)%4);
  const inRef=useRef(null);
  const fileRef=useRef(null);
  const play=useSnd(snd);

  const apiCall=useCallback(async(url,opts={})=>{
    const headers={"Content-Type":"application/json",...(opts.headers||{})};
    if(authToken)headers.Authorization=`Bearer ${authToken}`;
    const res=await fetch(url,{...opts,headers});
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||`Request failed (${res.status})`);
    return data;
  },[authToken]);

  const cloudPull=useCallback(async(token)=>{
    try{
      setSyncing(true);
      const r=await fetch("/api/sync/pull",{headers:{Authorization:`Bearer ${token}`}});
      const d=await r.json();
      if(d.progress){
        if(d.progress.general){setProg(d.progress.general);sP(d.progress.general,PK);}
        if(d.progress.cs){setCsProg(d.progress.cs);sP(d.progress.cs,CS_PK);}
      }
      if(d.profile){
        const u={name:d.profile.name,username:d.profile.username,email:d.profile.email,age:d.profile.age,photo:d.profile.photo,color:avC(d.profile.name||"?")};
        setUser(u);sU(u);
      }
      if(d.settings){
        setDark(!!d.settings.dark);
        setSnd(d.settings.sound!==false);
        sCfg({sound:d.settings.sound!==false,dark:!!d.settings.dark,viewMode:d.settings.viewMode||"mobile"});
        if(d.settings.viewMode){setViewMode(d.settings.viewMode);try{localStorage.setItem("e5k_viewMode",d.settings.viewMode);}catch{}}
      }
      if(Array.isArray(d.perfHistory)){localStorage.setItem("e5k_perf",JSON.stringify(d.perfHistory.slice(-20)));}
      setCloudConnected(true);
    }catch(e){console.warn("Cloud pull failed:",e.message);}finally{setSyncing(false);}
  },[]);

  const cloudPush=useCallback(async(extra={})=>{
    if(!authToken)return;
    try{const body={general:prog,cs:csProg,...extra};await apiCall("/api/sync/push",{method:"POST",body:JSON.stringify(body)});}catch(e){console.warn("Cloud push failed:",e.message);}
  },[authToken,prog,csProg,apiCall]);

  async function fetchLeaderboard(){
    setLeaderboardLoading(true);
    try{
      const headers={"Content-Type":"application/json"};
      if(authToken)headers["Authorization"]=`Bearer ${authToken}`;
      const res=await fetch("/api/leaderboard",{method:"GET",headers});
      if(res.ok){const d=await res.json();setLeaderboard(d.leaderboard||[]);setLeaderboardRank(d.myRank);}
    }catch(e){console.warn("Leaderboard fetch failed:",e.message);}
    setLeaderboardLoading(false);
  }

  function switchViewMode(mode){
    setViewMode(mode);
    try{localStorage.setItem("e5k_viewMode",mode);}catch{}
    if(authToken)cloudPush({settings:{sound:snd,dark,viewMode:mode}});
    window.location.hash=mode==="desktop"?"#/desktop":"#/app";
  }

  const doSignUp=useCallback(async()=>{
    setAuthErr("");setAuthMsg("");setAuthLoading(true);
    try{
      const d=await apiCall("/api/auth/signup",{method:"POST",body:JSON.stringify({name:authName,username:authUsername,email:authEmail,password:authPass,age:authAge})});
      localStorage.setItem("e5k_token",d.token);setAuthToken(d.token);setUser(d.user);sU(d.user);
      await cloudPull(d.token);setView("setup");
    }catch(e){setAuthErr(e.message);}finally{setAuthLoading(false);}
  },[authName,authUsername,authEmail,authPass,authAge,apiCall,cloudPull]);

  const doSignIn=useCallback(async()=>{
    setAuthErr("");setAuthMsg("");setAuthLoading(true);
    try{
      const d=await apiCall("/api/auth/signin",{method:"POST",body:JSON.stringify({email:authEmail,password:authPass})});
      localStorage.setItem("e5k_token",d.token);setAuthToken(d.token);setUser(d.user);sU(d.user);
      await cloudPull(d.token);setView("home");
    }catch(e){setAuthErr(e.message);}finally{setAuthLoading(false);}
  },[authEmail,authPass,apiCall,cloudPull]);

  const doForgot=useCallback(async()=>{
    setAuthErr("");setAuthMsg("");setAuthLoading(true);
    try{
      const d=await apiCall("/api/auth/forgot-password",{method:"POST",body:JSON.stringify({email:authEmail})});
      setAuthMsg(d.message||"Reset link sent! Check your email.");
      if(d.resetToken)setAuthToken(d.resetToken);
    }catch(e){setAuthErr(e.message);}finally{setAuthLoading(false);}
  },[authEmail,apiCall]);

  const doResetPass=useCallback(async()=>{
    setAuthErr("");setAuthMsg("");setAuthLoading(true);
    try{
      const d=await apiCall("/api/auth/reset-password",{method:"POST",body:JSON.stringify({token:authToken,password:authPass})});
      setAuthMsg(d.message||"Password reset! You can now sign in.");
      setAuthView("signin");setAuthToken(null);localStorage.removeItem("e5k_token");
    }catch(e){setAuthErr(e.message);}finally{setAuthLoading(false);}
  },[authToken,authPass,apiCall]);

  const doSignOut=useCallback(()=>{
    localStorage.removeItem("e5k_token");setAuthToken(null);setCloudConnected(false);setUser(null);setView("landing");
  },[]);

  const T=TH[dark?"dark":"light"];
  const curProg=isCS?csProg:prog;
  const dayDiff=QDAY(curProg.day>100?100:curProg.day);
  const lvDay=isCS?dayDiff:getAdaptDiff(dayDiff);
  const lv=isCS?CS_LC[lvDay]:LC[lvDay];
  const phrases=curProg.totalAnswered,pct=Math.min(phrases/5000*100,100),acc=phrases>0?Math.round(curProg.totalCorrect/phrases*100):0;
  const uLv=getLv(prog.xp),nLv=getNext(prog.xp);

  useEffect(()=>{const savedToken=localStorage.getItem("e5k_token");Promise.all([lP(PK),lP(CS_PK),lCfg(),lU()]).then(([p,cp,c,u])=>{setProg(p);setCsProg(cp);setDark(c.dark||false);setSnd(c.sound!==false);setUser(u);if(savedToken){setAuthToken(savedToken);cloudPull(savedToken).then(()=>{if(!u?.name)setView("setup");else setView("home");});}else if(!u?.name)setView("landing");else setView("home");});},[]);
  useEffect(()=>{if(view==="quiz"&&qs[qi]?.qt==="w"&&inRef.current)setTimeout(()=>inRef.current?.focus(),80);},[view,qKey]);
  useEffect(()=>{if(!authToken)return;const interval=setInterval(()=>{cloudPush();},300000);return()=>clearInterval(interval);},[authToken,prog,csProg]);
  useEffect(()=>{const handle=()=>{if(document.visibilityState==="visible"&&authToken)cloudPush();};document.addEventListener("visibilitychange",handle);return()=>document.removeEventListener("visibilitychange",handle);},[authToken]);

  const W={maxWidth:620,margin:"0 auto",padding:"1rem",color:T.txt,background:T.root,minHeight:"100vh",fontFamily:"system-ui,sans-serif",direction:"ltr",textAlign:"left"};
  const K=(e={})=>({background:T.s2,border:`0.5px solid ${T.bd}`,borderRadius:14,padding:"1.1rem 1.25rem",marginBottom:".85rem",...e});
  const Btn=(bg,cl="#fff",e={})=>({width:"100%",padding:".82rem",borderRadius:10,border:"none",background:bg,color:cl,fontSize:15,fontWeight:700,cursor:"pointer",...e});
  const PC=["#22C55E","#3B82F6","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#F97316","#EC4899"];
  const saveCfg=useCallback((upd)=>{lCfg().then(c=>sCfg({...c,...upd}));if(authToken&&upd){cloudPush({settings:upd});}},[authToken,cloudPush]);
  const handlePhoto=(e)=>{const file=e.target.files[0];if(!file)return;const rd=new FileReader();rd.onload=(ev)=>{const img=new Image();img.onload=()=>{const cv=document.createElement("canvas");cv.width=cv.height=140;const ctx=cv.getContext("2d"),mn=Math.min(img.width,img.height);ctx.drawImage(img,(img.width-mn)/2,(img.height-mn)/2,mn,mn,0,0,140,140);const b64=cv.toDataURL("image/jpeg",.78);const nu={...user,photo:b64};setUser(nu);sU(nu);if(authToken)apiCall("/api/auth/update-profile",{method:"POST",body:JSON.stringify({photo:b64})}).catch(()=>{});};img.src=ev.target.result;};rd.readAsDataURL(file);};
  const saveProfile=useCallback(async(upd)=>{
    setAuthErr("");setAuthMsg("");
    try{
      if(authToken){const d=await apiCall("/api/auth/update-profile",{method:"POST",body:JSON.stringify(upd)});setUser(d.user);sU(d.user);setAuthMsg("Profile updated!");}
      else{const nu={...user,...upd};setUser(nu);sU(nu);setAuthMsg("Profile updated!");}
    }catch(e){setAuthErr(e.message);}
  },[authToken,apiCall,user]);
  const awardXp=useCallback((amt)=>{if(!amt)return;setSXp(s=>s+amt);setXpPop("+"+amt+" XP");setTimeout(()=>setXpPop(null),1100);},[]);
  const resetQ=useCallback(()=>{setSel(null);setInp("");setRes(null);setHl(0);setShowA(false);setTries(0);setShkIdx(null);setPuzzleDone(false);setPuzzleOk(false);},[]);

  const advance=useCallback((xpAmt)=>{
    const isOk=xpAmt>0;const curQ=qs[qi];
    if(!isOk&&curQ&&curQ.qt==="w"){setWrongQs(w=>[...w,{...curQ}]);}
    play("nxt");const nOk=ok+(isOk?1:0);const nStr=isOk?cStreak+1:0;setCStreak(nStr);
    let bonus=0;if(nStr>0&&(nStr===5||nStr===10||nStr===20)){bonus=nStr===5?XP.s5:nStr===10?XP.s10:XP.s20;play("stk");setStkPop("+"+bonus+"🔥");setTimeout(()=>setStkPop(null),1400);}
    awardXp(xpAmt+bonus);
    if(qi+1>=qs.length){
      const total=sXp+xpAmt+bonus;
      const ns=curProg.lastDate===ystStr()?curProg.streak+1:1;
      const np={...curProg,totalCorrect:curProg.totalCorrect+nOk,totalAnswered:curProg.totalAnswered+qs.length,xp:(curProg.xp||0)+total};
      if(!practice)Object.assign(np,{day:curProg.day+1,streak:ns,lastDate:toStr(),bestStreak:Math.max(curProg.bestStreak||0,ns)});
      if(isCS){setCsProg(np);sP(np,CS_PK);}else{setProg(np);sP(np,PK);}
      setFOk(nOk);setFXp(total);setView("results");cloudPush();
      if(!practice)recordPerf(Math.round(nOk/qs.length*100));
      if(nOk>=qs.length*.9)play("done");
    }else{setOk(nOk);setQi(q=>q+1);resetQ();setQKey(k=>k+1);}
  },[ok,cStreak,qi,qs,sXp,curProg,practice,isCS,play,awardXp,resetQ]);

  const handleMCQ=useCallback((i)=>{
    if(sel!==null)return;play("nxt");setSel(i);
    if(i===qs[qi]?.c){play("ok");setPtcl(true);setTimeout(()=>setPtcl(false),700);}
    else{play("no");setShkIdx(i);setTimeout(()=>setShkIdx(null),500);setHrt(h=>Math.max(0,h-1));setWrongQs(w=>[...w,{...qs[qi],userAns:qs[qi].opts[i]}]);}
  },[sel,qs,qi,play]);
  const handleWrite=useCallback(()=>{if(!inp.trim()||showA)return;const r=checkAns(inp,qs[qi]?.en||"");setRes(r);setTries(t=>t+1);if(r==="ok"||r==="close"){play(r==="ok"?"ok":"close");setPtcl(true);setTimeout(()=>setPtcl(false),700);}else{play("no");setShkIdx(-1);setTimeout(()=>setShkIdx(null),500);}},[inp,showA,qs,qi,play]);
  const handleHint=useCallback(()=>{play("hint");setHl(h=>Math.min(h+1,2));setRes(null);setInp("");},[play]);
  const handleShowA=useCallback(()=>{setShowA(true);setHrt(h=>Math.max(0,h-1));play("no");},[play]);

  useEffect(()=>{
    if(view==="quiz")return;
    if(view!=="study")return;
    const fn=(e)=>{if(e.key==="ArrowRight"||e.key==="d"){if(studyIdx+1<qs.length){setStudyIdx(i=>i+1);setStudyFlipped(false);}else{startQuizFromStudy();}}else if(e.key==="ArrowLeft"||e.key==="a"){if(studyIdx>0){setStudyIdx(i=>i-1);setStudyFlipped(false);}}else if(e.key===" "||e.key==="Enter"){setStudyFlipped(f=>!f);}};
    window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn);
  },[view,studyIdx,qs.length]);

  useEffect(()=>{
    if(view!=="quiz")return;
    const q=qs[qi];if(!q||q.qt!=="p")return;
    const words=q.en.split(/\s+/);
    const shuffled=[...words].sort(()=>Math.random()-0.5);
    setPuzzleChips(shuffled.map((w,i)=>({id:i+Math.random(),word:w,used:false})));
    setPuzzleAnswer([]);setPuzzleDone(false);setPuzzleOk(false);
  },[view,qKey]);

  useEffect(()=>{
    if(view!=="quiz")return;
    const fn=(e)=>{const k=e.key.toLowerCase();const q=qs[qi];if(!q)return;
      if(q.qt==="m"){if(sel!==null){if(k==="enter"||k===" "){e.preventDefault();advance(sel===q.c?XP.mcq:0);}}else{const i=["w","a","s","d"].indexOf(k);if(i!==-1){e.preventDefault();handleMCQ(i);}}}
      else if(q.qt==="p"){if(puzzleDone&&(k==="enter"||k===" ")){e.preventDefault();advance(puzzleOk?XP.wrt0:0);}}
      else{const done=res!==null||showA;if(done){if(k==="enter"){e.preventDefault();const wXp=showA?0:res==="ok"||res==="close"?(hl===0?XP.wrt0:hl===1?XP.wrt1:XP.wrt2):0;advance(wXp);}}else if(k==="enter"){e.preventDefault();handleWrite();}}
    };
    window.addEventListener("keydown",fn);return()=>window.removeEventListener("keydown",fn);
  },[view,sel,res,showA,qs,qi,hl,advance,handleMCQ,handleWrite]);

  const startQuizFromStudy=useCallback(()=>{setQi(0);setSel(null);setInp("");setRes(null);setHl(0);setShowA(false);setTries(0);setOk(0);setSXp(0);setHrt(5);setCStreak(0);setShkIdx(null);setWrongQs([]);setQKey(k=>k+1);setView("quiz");},[]);

  if(route==="landing")return <LandingPage/>;
  if(route==="desktop")return <DesktopApp/>;
  if(route==="profile")return <div style={{minHeight:"100vh",background:T.bg}}><ProfileView username={routeProfile} T={T} K={K} dark={dark} onBack={()=>window.location.hash=""}/></div>;


  const startQuiz=async(isPrac=false,csMode=false)=>{
    setIsCS(csMode);setPractice(isPrac);setView("gen");setGs(0);setHrt(5);setOk(0);setSXp(0);setCStreak(0);setWrongQs([]);setShowWrong(false);
    const p=csMode?csProg:prog;const qkPrefix=csMode?CS_QK:QK;
    const dayDiff=QDAY(p.day>100?100:p.day);const effDiff=csMode?dayDiff:getAdaptDiff(dayDiff);
    try{let questions=isPrac?null:await lQ(p.day,qkPrefix);
      if(!questions){setGs(1);questions=await genQs(p.day,effDiff,csMode);if(!isPrac)await sQ(p.day,questions,qkPrefix);}
      setQs(questions);setQi(0);resetQ();setQKey(k=>k+1);setStudyIdx(0);setStudyFlipped(false);
      setView("study"); // Go to study/review first
    }catch(e){setErrMsg(String(e.message));setView("err");}
  };
  const doReset=async(csMode=false)=>{const p={...DEF};if(csMode){setCsProg(p);await sP(p,CS_PK);}else{setProg(p);await sP(p,PK);}setRst(false);};
  const doSetup=async()=>{if(!sName.trim())return;const u={name:sName.trim(),age:sAge,email:sEmail,color:avC(sName.trim())};setUser(u);await sU(u);cloudPush();setView("home");};

  // ── LANDING PAGE ──────────────────────────────────────
  if(view==="landing")return(
    <div style={{...W,display:"flex",flexDirection:"column",minHeight:"100vh",direction:"ltr",textAlign:"left"}}><style>{CSS}</style>
      <div style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"2rem 1.5rem",textAlign:"center"}}>
        <div style={{marginBottom:24,animation:"pop .6s ease"}}><img src={LOGO} alt="EN-5000" style={{width:120,height:120,objectFit:"contain",borderRadius:24,boxShadow:"0 8px 40px rgba(30,80,200,.25)"}}/></div>
        <div style={{animation:"fUp .5s ease .1s both"}}>
          <h1 style={{fontSize:32,fontWeight:700,color:T.txt,marginBottom:4,letterSpacing:"-0.5px"}}>EN-5000</h1>
          <p style={{fontSize:16,color:T.m,marginBottom:6,fontWeight:600}}>Learn 5,000 English Phrases</p>
          <p style={{fontSize:13,color:T.m,marginBottom:32,lineHeight:1.6,maxWidth:300}}>Master English & programming vocabulary with AI-powered lessons, Arabic pronunciation, and daily streaks.</p>
        </div>
        <div style={{width:"100%",maxWidth:340,animation:"fUp .5s ease .2s both",marginBottom:20}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
            {[{ic:"🗣️",t:"5,000+",s:"Phrases"},{ic:"🎯",t:"100",s:"Day Plan"},{ic:"💻",t:"CS/Dev",s:"English"},{ic:"🤖",t:"AI",s:"Powered"}].map((f,i)=>(
              <div key={i} style={{...K({marginBottom:0}),textAlign:"center",padding:"14px 10px"}}><div style={{fontSize:22,marginBottom:4}}>{f.ic}</div><div style={{fontSize:15,fontWeight:700,color:T.txt}}>{f.t}</div><div style={{fontSize:11,color:T.m}}>{f.s}</div></div>
            ))}
          </div>
        </div>
        <div style={{width:"100%",maxWidth:340,animation:"fUp .5s ease .3s both"}}>
          <button style={{...Btn(LC.Easy.fill),marginBottom:10,fontSize:16,padding:".9rem"}} className="qbtn" onClick={()=>{setAuthView("signup");setView("auth");}}>Create Free Account ✨</button>
          <button style={{...Btn("transparent",T.txt,{border:`1.5px solid ${T.bdS}`}),marginBottom:12,fontSize:15}} className="qbtn" onClick={()=>{setAuthView("signin");setView("auth");}}>Sign In</button>
          <p style={{fontSize:12,color:T.m,lineHeight:1.5}}>Free forever. No credit card needed.<br/>Sync progress across devices.</p>
        </div>
      </div>
      <div style={{padding:"1rem",textAlign:"center",borderTop:`0.5px solid ${T.bd}`}}>
        <p style={{fontSize:11,color:T.m}}>100 Days • General + Programming English<br/>Egyptian Arabic Pronunciation</p>
      </div>
    </div>
  );

  // ── AUTH SCREENS ──────────────────────────────────────
  if(view==="auth"){
    const authTitle=authView==="signup"?"Create Account":authView==="signin"?"Welcome Back":authView==="forgot"?"Reset Password":"Set New Password";
    const authIcon=authView==="signup"?"✨":authView==="signin"?"👋":authView==="forgot"?"🔑":"🔒";
    return(
    <div style={{...W,display:"flex",alignItems:"center",justifyContent:"center",direction:"ltr",textAlign:"left"}}><style>{CSS}</style>
      <div style={{...K(),width:"100%",maxWidth:400,animation:"pop .4s ease"}}>
        <button className="ibtn" style={{fontSize:14,color:T.m,marginBottom:12,display:"flex",alignItems:"center",gap:4}} onClick={()=>{setAuthErr("");setAuthMsg("");setView("landing");}}>← Back</button>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:36,marginBottom:8}}>{authIcon}</div>
          <h2 style={{fontSize:20,fontWeight:700,color:T.txt,marginBottom:4}}>{authTitle}</h2>
          <p style={{fontSize:13,color:T.m}}>
            {authView==="signup"?"Start your English learning journey":authView==="signin"?"Continue learning where you left off":authView==="forgot"?"Enter your email to get a reset token":"Enter your new password below"}
          </p>
        </div>
        {authErr&&<div style={{padding:".6rem 1rem",borderRadius:8,background:"rgba(239,68,68,.08)",border:"0.5px solid rgba(239,68,68,.3)",color:"#DC2626",fontSize:13,marginBottom:12}}>{authErr}</div>}
        {authMsg&&<div style={{padding:".6rem 1rem",borderRadius:8,background:"rgba(34,197,94,.08)",border:"0.5px solid rgba(34,197,94,.3)",color:"#16A34A",fontSize:13,marginBottom:12}}>{authMsg}</div>}
        {authView==="signup"&&<>
          <input value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Your name" className="inp" style={{width:"100%",padding:".75rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:15,marginBottom:10,boxSizing:"border-box"}}/>
          <div style={{position:"relative",marginBottom:10}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:T.m,fontSize:15}}>@</span>
            <input value={authUsername} onChange={e=>setAuthUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,""))} placeholder="username (letters, numbers, _)" className="inp" style={{width:"100%",padding:".75rem 1rem .75rem 2rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:15,boxSizing:"border-box",fontFamily:"monospace"}}/>
          </div>
          <input value={authAge} onChange={e=>setAuthAge(e.target.value)} type="number" placeholder="Age (optional)" className="inp" style={{width:"100%",padding:".75rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:15,marginBottom:10,boxSizing:"border-box"}}/>
          <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} type="email" placeholder="Email" className="inp" style={{width:"100%",padding:".75rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:15,marginBottom:10,boxSizing:"border-box"}}/>
          <input value={authPass} onChange={e=>setAuthPass(e.target.value)} type="password" placeholder="Password (min 6 chars)" className="inp" style={{width:"100%",padding:".75rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:15,marginBottom:14,boxSizing:"border-box"}}/>
          <button style={Btn(LC.Easy.fill)} className="qbtn" onClick={doSignUp} disabled={authLoading||!authName.trim()||!authUsername.trim()||!authEmail.trim()||authPass.length<6||authUsername.length<3}>{authLoading?"Creating account...":"Sign Up ✨"}</button>
          <p style={{fontSize:13,color:T.m,textAlign:"center",marginTop:14}}>Already have an account? <button onClick={()=>{setAuthErr("");setAuthMsg("");setAuthView("signin");}} style={{background:"none",border:"none",color:LC.Easy.tx,cursor:"pointer",fontWeight:600,textDecoration:"underline",fontSize:13}}>Sign In</button></p>
        </>}
        {authView==="signin"&&<>
          <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} type="email" placeholder="Email" className="inp" style={{width:"100%",padding:".75rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:15,marginBottom:10,boxSizing:"border-box"}}/>
          <input value={authPass} onChange={e=>setAuthPass(e.target.value)} type="password" placeholder="Password" className="inp" style={{width:"100%",padding:".75rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:15,marginBottom:14,boxSizing:"border-box"}}/>
          <button style={Btn(LC.Easy.fill)} className="qbtn" onClick={doSignIn} disabled={authLoading||!authEmail.trim()||!authPass}>{authLoading?"Signing in...":"Sign In 👋"}</button>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:12}}>
            <button onClick={()=>{setAuthErr("");setAuthMsg("");setAuthView("signup");}} style={{background:"none",border:"none",color:T.m,cursor:"pointer",fontSize:12}}>Create account</button>
            <button onClick={()=>{setAuthErr("");setAuthMsg("");setAuthView("forgot");}} style={{background:"none",border:"none",color:T.m,cursor:"pointer",fontSize:12,textDecoration:"underline"}}>Forgot password?</button>
          </div>
        </>}
        {authView==="forgot"&&<>
          <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)} type="email" placeholder="Your email" className="inp" style={{width:"100%",padding:".75rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:15,marginBottom:14,boxSizing:"border-box"}}/>
          <button style={Btn(LC.Easy.fill)} className="qbtn" onClick={doForgot} disabled={authLoading||!authEmail.trim()}>{authLoading?"Sending...":"Send Reset Token 🔑"}</button>
          {authMsg&&<button onClick={()=>{setAuthErr("");setAuthMsg("");setAuthView("reset");}} style={{display:"block",width:"100%",marginTop:10,background:"none",border:`1px solid ${T.bdS}`,color:T.txt,cursor:"pointer",fontSize:14,padding:".7rem",borderRadius:10,fontWeight:600}}>Enter Reset Token →</button>}
          <p style={{fontSize:13,color:T.m,textAlign:"center",marginTop:14}}><button onClick={()=>{setAuthErr("");setAuthMsg("");setAuthView("signin");}} style={{background:"none",border:"none",color:T.m,cursor:"pointer",fontSize:13}}>← Back to Sign In</button></p>
        </>}
        {authView==="reset"&&<>
          <input value={authToken||""} onChange={e=>setAuthToken(e.target.value)} placeholder="Reset token (from email/API)" className="inp" style={{width:"100%",padding:".75rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:14,marginBottom:10,boxSizing:"border-box",fontFamily:"monospace"}}/>
          <input value={authPass} onChange={e=>setAuthPass(e.target.value)} type="password" placeholder="New password (min 6 chars)" className="inp" style={{width:"100%",padding:".75rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:15,marginBottom:14,boxSizing:"border-box"}}/>
          <button style={Btn(LC.Easy.fill)} className="qbtn" onClick={doResetPass} disabled={authLoading||!authToken||authPass.length<6}>{authLoading?"Resetting...":"Reset Password 🔒"}</button>
          <p style={{fontSize:13,color:T.m,textAlign:"center",marginTop:14}}><button onClick={()=>{setAuthErr("");setAuthMsg("");setAuthView("forgot");}} style={{background:"none",border:"none",color:T.m,cursor:"pointer",fontSize:13}}>← Back</button></p>
        </>}
      </div>
    </div>);
  }

  if(view==="loading")return(<div style={{...W,display:"flex",alignItems:"center",justifyContent:"center"}}><style>{CSS}</style><div style={{textAlign:"center"}}><div style={{width:44,height:44,border:`3px solid ${T.bd}`,borderTopColor:LC.Easy.fill,borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 1rem"}}/><p style={{color:T.m,fontSize:14}}>Loading...</p></div></div>);

  if(view==="setup")return(
    <div style={{...W,display:"flex",alignItems:"center",justifyContent:"center"}}><style>{CSS}</style>
      <div style={{...K(),width:"100%",maxWidth:420,textAlign:"center",animation:"pop .5s ease"}}>
        <img src={LOGO} alt="EN-5000" style={{width:110,height:110,objectFit:"contain",marginBottom:6,borderRadius:18,boxShadow:"0 4px 24px rgba(30,80,200,.18)"}}/>
        <h1 style={{fontSize:22,fontWeight:700,color:T.txt,marginBottom:4}}>English 5000</h1>
        <p style={{fontSize:14,color:T.m,marginBottom:22,fontFamily:"Cairo,sans-serif",direction:"rtl",lineHeight:1.8}}>أهلاً! رحلتك لتعلم 5000 جملة إنجليزي وتعلم نطقها بالعربي 🚀</p>
        {[{ph:"اسمك / Your name *",v:sName,fn:e=>setSName(e.target.value),t:"text"},{ph:"سنك / Your age",v:sAge,fn:e=>setSAge(e.target.value),t:"number"},{ph:"إيميلك / Email",v:sEmail,fn:e=>setSEmail(e.target.value),t:"email"}].map((f,i,arr)=>(
          <input key={i} type={f.t} placeholder={f.ph} value={f.v} onChange={f.fn} dir="auto" onKeyDown={i===arr.length-1?e=>e.key==="Enter"&&doSetup():undefined} className="inp" style={{width:"100%",padding:".75rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:15,marginBottom:10,fontFamily:"Cairo,sans-serif",textAlign:"center",boxSizing:"border-box",transition:"border-color .2s"}}/>
        ))}
        <button style={Btn(LC.Easy.fill)} className="qbtn" onClick={doSetup} disabled={!sName.trim()}>يلا نبدأ! Let's go 🚀</button>
      </div>
    </div>
  );

  // Profile view
  if(profView)return(
    <div style={W}><style>{CSS}</style>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><button className="ibtn" style={{fontSize:20,color:T.m}} onClick={()=>{setProfView(false);setAuthErr("");setAuthMsg("");}}>←</button><img src={LOGO} alt="EN-5000" style={{width:32,height:32,objectFit:"contain",borderRadius:7}}/><h2 style={{fontSize:18,fontWeight:700,color:T.txt}}>My Profile</h2></div>
      {authErr&&<div style={{padding:".5rem 1rem",borderRadius:8,background:"rgba(239,68,68,.08)",border:"0.5px solid rgba(239,68,68,.3)",color:"#DC2626",fontSize:13,marginBottom:10}}>{authErr}</div>}
      {authMsg&&<div style={{padding:".5rem 1rem",borderRadius:8,background:"rgba(34,197,94,.08)",border:"0.5px solid rgba(34,197,94,.3)",color:"#16A34A",fontSize:13,marginBottom:10}}>{authMsg}</div>}
      <div style={{...K(),textAlign:"center",animation:"pop .4s ease"}}>
        <div style={{position:"relative",display:"inline-block",marginBottom:14}}>
          <Av user={user} size={90} onClick={()=>fileRef.current?.click()}/>
          <button onClick={()=>fileRef.current?.click()} style={{position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:lv.fill,border:`2px solid ${T.s2}`,color:"#fff",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>+</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
        </div>
        <div style={{fontSize:11,color:T.m,marginBottom:12}}>Tap photo to change • {authToken?"☁️ Synced to cloud":"📱 Local only"}</div>
        {user?.username&&<div style={{fontSize:13,color:LC.Easy.tx,fontWeight:500,marginBottom:10}}>@{user.username}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:10,textAlign:"left"}}>
          {[{l:"Name",v:user?.name||"",ph:"Your name",k:"name"},{l:"Username",v:user?.username||"",ph:"username",k:"username",mono:true}, {l:"Age",v:user?.age||"",ph:"Your age",k:"age",t:"number"},{l:"Email",v:user?.email||"",ph:"Your email",k:"email",t:"email"}].map((f,i)=>(
            <div key={i}><label style={{fontSize:11,fontWeight:600,color:T.m,display:"block",marginBottom:4}}>{f.l}</label>
            <div style={{position:"relative"}}>
              {f.k==="username"&&<span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:T.m,fontSize:15}}>@</span>}
              <input type={f.t||"text"} defaultValue={f.v} placeholder={f.ph} id={`prof_${f.k}`} className="inp" style={{width:"100%",padding:f.k==="username"?".6rem .8rem .6rem 1.8rem":".6rem .8rem",borderRadius:8,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:14,boxSizing:"border-box",fontFamily:f.mono?"monospace":"inherit"}}/>
            </div>
            </div>
          ))}
        </div>
        <button style={{...Btn(LC.Easy.fill),marginTop:14,fontSize:14}} className="qbtn" onClick={()=>saveProfile({name:document.getElementById("prof_name").value,username:document.getElementById("prof_username").value,age:document.getElementById("prof_age").value,email:document.getElementById("prof_email").value})}>Save Profile ✓</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        {[{v:prog.xp||0,l:"Total XP",c:"#F59E0B"},{v:`🔥 ${prog.streak}`,l:"Day streak"},{v:prog.bestStreak||0,l:"Best streak"},{v:`${prog.totalAnswered>0?Math.round(prog.totalCorrect/prog.totalAnswered*100):0}%`,l:"General acc."},{v:prog.totalAnswered,l:"General phrases",c:LC.Easy.tx},{v:csProg.totalAnswered,l:"CS phrases",c:CS_LC.Easy.tx}].map((s,i)=>(
          <div key={i} style={{...K(),textAlign:"center",marginBottom:0}}><div style={{fontSize:17,fontWeight:700,color:s.c||T.txt}}>{s.v}</div><div style={{fontSize:11,color:T.m,marginTop:2}}>{s.l}</div></div>
        ))}
      </div>
      {authToken&&<button style={{...Btn("transparent","#EF4444",{border:"1px solid rgba(239,68,68,.3)"}),fontSize:13}} className="qbtn" onClick={doSignOut}>🚪 Sign Out</button>}
    </div>
  );

  // Home view
  if(view==="home")return(
    <div style={W}><style>{CSS}</style>
      <Ad idx={topAd.current} T={T} sm/>
      {/* App logo banner */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:".85rem",animation:"fUp .3s ease"}}>
        <img src={LOGO} alt="EN-5000" style={{width:52,height:52,objectFit:"contain",borderRadius:12,flexShrink:0,boxShadow:"0 2px 12px rgba(30,80,200,.18)"}}/>
        <div><div style={{fontSize:19,fontWeight:700,color:T.txt,lineHeight:1.2}}>EN-5000</div><div style={{fontSize:11,color:T.m}}>تعلم · مارس · تحدث بثقة</div></div>
      </div>
      <div style={{...K(),display:"flex",alignItems:"center",gap:12,animation:"fUp .35s ease"}}>
        <Av user={user} size={50} onClick={()=>setProfView(true)}/>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:T.txt,fontFamily:"Cairo,sans-serif"}}>مرحباً، {user?.name}! 👋</div><div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}><span style={{fontSize:11,fontWeight:700,color:uLv.c}}>{uLv.i} {uLv.n}</span><span style={{fontSize:11,color:T.m}}>· {prog.xp||0} XP</span></div><div style={{height:4,background:T.s1,borderRadius:2,overflow:"hidden",marginTop:5}}><div style={{height:"100%",width:`${nLv?Math.min(((prog.xp||0)-uLv.min)/(nLv.min-uLv.min)*100,100):100}%`,background:uLv.c,borderRadius:2,transition:"width .5s"}}/></div></div>
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {syncing&&<span style={{fontSize:10,color:LC.Easy.tx,textAlign:"center"}}>☁️</span>}
          {cloudConnected&&!syncing&&<span style={{fontSize:10,color:LC.Easy.tx,textAlign:"center",opacity:.6}} title="Cloud synced">☁️</span>}
          <button className="ibtn" style={{fontSize:18,color:T.m}} onClick={()=>{const n=!dark;setDark(n);saveCfg({dark:n});}}>{dark?"☀️":"🌙"}</button>
          <button className="ibtn" style={{fontSize:16,color:T.m}} onClick={()=>setShowCfg(v=>!v)}>⚙️</button>
        </div>
      </div>
      <div style={{...K(),animation:"pop .4s ease .05s both"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontSize:13,fontWeight:700,color:T.txt}}>🗣️ General English</div><div style={{fontSize:11,color:T.m}}>Day {prog.day}/100 · {prog.totalAnswered}/5000</div></div>
          <span style={{fontSize:11,fontWeight:700,color:LC[QDAY(prog.day)].tx,background:LC[QDAY(prog.day)].bg,border:`0.5px solid ${LC[QDAY(prog.day)].br}`,padding:"2px 10px",borderRadius:20}}>{QDAY(prog.day)}</span>
        </div>
        <div style={{height:6,background:T.s1,borderRadius:3,overflow:"hidden",marginBottom:10}}><div style={{height:"100%",width:`${Math.min(prog.totalAnswered/5000*100,100).toFixed(1)}%`,background:LC[QDAY(prog.day)].fill,borderRadius:3,transition:"width .5s"}}/></div>
        <button style={Btn(LC[QDAY(prog.day)].fill)} className="qbtn" onClick={()=>startQuiz(false,false)}>
          {prog.lastDate===toStr()?"✏️ Practice more (day complete)":"📚 Study + Start Day "+prog.day}
        </button>
      </div>
      <div style={{...K(),animation:"pop .4s ease .1s both",border:`0.5px solid ${CS_LC[QDAY(csProg.day)].br}`,background:CS_LC[QDAY(csProg.day)].bg+"66"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div><div style={{fontSize:13,fontWeight:700,color:T.txt}}>💻 Programming English</div><div style={{fontSize:11,color:T.m}}>Day {csProg.day}/100 · {csProg.totalAnswered}/5000</div></div>
          <span style={{fontSize:11,fontWeight:700,color:CS_LC[QDAY(csProg.day)].tx,background:CS_LC[QDAY(csProg.day)].bg,border:`0.5px solid ${CS_LC[QDAY(csProg.day)].br}`,padding:"2px 10px",borderRadius:20}}>{QDAY(csProg.day)}</span>
        </div>
        <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}>{(CS_CATS[QDAY(csProg.day)]||[]).map((cat,i)=><span key={i} style={{fontSize:10,fontWeight:500,color:CS_LC[QDAY(csProg.day)].tx,background:CS_LC[QDAY(csProg.day)].bg,border:`0.5px solid ${CS_LC[QDAY(csProg.day)].br}`,padding:"2px 7px",borderRadius:20}}>{cat}</span>)}</div>
        <div style={{height:6,background:T.s1,borderRadius:3,overflow:"hidden",marginBottom:10}}><div style={{height:"100%",width:`${Math.min(csProg.totalAnswered/5000*100,100).toFixed(1)}%`,background:CS_LC[QDAY(csProg.day)].fill,borderRadius:3,transition:"width .5s"}}/></div>
        <button style={Btn(CS_LC[QDAY(csProg.day)].fill)} className="qbtn" onClick={()=>startQuiz(false,true)}>
          {csProg.lastDate===toStr()?"✏️ CS Practice more":"💻 Study + Start CS Day "+csProg.day}
        </button>
      </div>
      <div style={K()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><span style={{fontSize:12,color:T.m}}>Total journey</span><span style={{fontSize:12,fontWeight:700,color:T.m}}>{prog.totalAnswered+csProg.totalAnswered} / 10,000</span></div>
        <div style={{height:8,background:T.s1,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",display:"flex"}}><div style={{width:`${Math.min(prog.totalAnswered/10000*100,100).toFixed(1)}%`,background:LC.Easy.fill,borderRadius:"4px 0 0 4px",transition:"width .5s"}}/><div style={{width:`${Math.min(csProg.totalAnswered/10000*100,100).toFixed(1)}%`,background:CS_LC.Easy.fill,transition:"width .5s"}}/></div></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}><span style={{fontSize:10,color:LC.Easy.tx}}>🗣️ {prog.totalAnswered}</span><span style={{fontSize:10,color:CS_LC.Easy.tx}}>💻 {csProg.totalAnswered}</span></div>
      </div>
      {/* Grammar shortcut */}
      <div onClick={()=>setView("grammar")} style={{...K(),cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:"linear-gradient(135deg,"+LC.Easy.bg+","+LC.Medium.bg+")",border:`0.5px solid ${LC.Easy.br}`}}>
        <div style={{width:44,height:44,borderRadius:10,background:LC.Easy.fill,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>📖</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:T.txt}}>قواعد الإنجليزي</div>
          <div style={{fontSize:11,color:T.m,marginTop:1}}>شروحات مفصّلة لكل قاعدة بالعربي</div>
        </div>
        <span style={{fontSize:18,color:T.m}}>←</span>
      </div>
      {/* Leaderboard shortcut */}
      <div onClick={()=>{setView("leaderboard");fetchLeaderboard();}} style={{...K(),cursor:"pointer",display:"flex",alignItems:"center",gap:12,background:"linear-gradient(135deg,rgba(245,158,11,.08),rgba(239,68,68,.08))",border:"0.5px solid rgba(245,158,11,.2)"}}>
        <div style={{width:44,height:44,borderRadius:10,background:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🏆</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:T.txt}}>لوحة الصدارة</div>
          <div style={{fontSize:11,color:T.m,marginTop:1}}>شوف أفضل المتعلمين</div>
        </div>
        <span style={{fontSize:18,color:T.m}}>←</span>
      </div>
      {prog.streak>=2&&<div style={{...K(),background:LC[QDAY(prog.day)].bg,border:`0.5px solid ${LC[QDAY(prog.day)].br}`}}><p style={{color:LC[QDAY(prog.day)].tx,fontSize:14,fontWeight:700,marginBottom:2}}>{prog.streak>=7?`🔥 ${prog.streak} day streak!`:`🔥 ${prog.streak} day streak — keep going!`}</p><p style={{fontSize:12,color:T.m}}>Come back every day!</p></div>}
      {showCfg&&<div style={{...K(),animation:"fUp .2s ease"}}>
        <div style={{fontSize:13,fontWeight:700,color:T.txt,marginBottom:14}}>⚙️ Settings</div>
        {[{l:"🔊 Sound effects",v:snd,fn:()=>{const n=!snd;setSnd(n);saveCfg({sound:n});}},{l:dark?"☀️ Light mode":"🌙 Dark mode",v:dark,fn:()=>{const n=!dark;setDark(n);saveCfg({dark:n});}}].map((s,i,a)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:i<a.length-1?12:0,marginBottom:i<a.length-1?12:0,borderBottom:i<a.length-1?`0.5px solid ${T.bd}`:"none"}}><span style={{fontSize:13,color:T.s}}>{s.l}</span><Tog v={s.v} fn={s.fn} fill={LC.Easy.fill}/></div>
        ))}
        {/* View Mode Toggle */}
        <div style={{...K(),marginBottom:12}}>
          <div style={{fontSize:14,fontWeight:700,color:T.txt,marginBottom:8}}>🖥️ نسخة التطبيق</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>switchViewMode("mobile")} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${viewMode==="mobile"?"#3B82F6":T.bdS}`,background:viewMode==="mobile"?"rgba(59,130,246,.1)":"transparent",color:viewMode==="mobile"?"#3B82F6":T.m,fontWeight:600,cursor:"pointer",fontSize:13}}>
              📱 موبايل
            </button>
            <button onClick={()=>switchViewMode("desktop")} style={{flex:1,padding:"10px",borderRadius:10,border:`2px solid ${viewMode==="desktop"?"#3B82F6":T.bdS}`,background:viewMode==="desktop"?"rgba(59,130,246,.1)":"transparent",color:viewMode==="desktop"?"#3B82F6":T.m,fontWeight:600,cursor:"pointer",fontSize:13}}>
              🖥️ ديسكتوب
            </button>
          </div>
        </div>
        <div style={{marginTop:12,paddingTop:12,borderTop:`0.5px solid ${T.bd}`,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          {rst?<span style={{fontSize:12,color:T.m}}>Reset? <button onClick={()=>{doReset(false);}} style={{background:"none",border:"none",color:LC.Easy.tx,cursor:"pointer",fontSize:12,fontWeight:700,textDecoration:"underline"}}>General</button> <button onClick={()=>{doReset(true);}} style={{background:"none",border:"none",color:CS_LC.Easy.tx,cursor:"pointer",fontSize:12,fontWeight:700,textDecoration:"underline"}}>CS</button> <button onClick={()=>setRst(false)} style={{background:"none",border:"none",color:T.m,cursor:"pointer",fontSize:12,textDecoration:"underline"}}>Cancel</button></span>
          :<button className="ibtn" style={{color:T.m,fontSize:12}} onClick={()=>setRst(true)}>🗑️ Reset progress</button>}
          {authToken&&<button className="ibtn" style={{color:"#EF4444",fontSize:12}} onClick={doSignOut}>🚪 Sign Out</button>}
        </div>
      </div>}
      <div style={{marginTop:12}}><Ad idx={botAd.current} T={T}/></div>
    </div>
  );

  if(view==="gen")return(<GenScreen prog={curProg} lv={lv} T={T} gs={gs} isCS={isCS}/>);

  // ── STUDY / REVIEW MODE ──────────────────────────────────────
  if(view==="study"&&qs.length>0){
    const q=qs[studyIdx];
    const doneAll=studyIdx>=qs.length-1;
    return(
      <div style={W}><style>{CSS}</style>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <button className="ibtn" style={{color:T.m,fontSize:14,display:"flex",alignItems:"center",gap:4}} onClick={()=>setView("home")}>← Exit</button>
          <div style={{textAlign:"center",display:"flex",alignItems:"center",gap:7,justifyContent:"center"}}>
            <img src={LOGO} alt="EN-5000" style={{width:28,height:28,objectFit:"contain",borderRadius:6}}/>
            <div><div style={{fontSize:13,fontWeight:600,color:T.txt}}>{isCS?"💻":"🗣️"} Review</div><div style={{fontSize:11,color:T.m}}>{studyIdx+1} / {qs.length}</div></div>
          </div>
          <button style={{background:lv.fill,color:"#fff",border:"none",borderRadius:8,padding:".45rem .9rem",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={startQuizFromStudy}>Start Quiz →</button>
        </div>
        {/* Progress bar */}
        <div style={{height:4,background:T.s1,borderRadius:2,overflow:"hidden",marginBottom:"1rem"}}><div style={{height:"100%",width:`${((studyIdx+1)/qs.length*100).toFixed(1)}%`,background:lv.fill,borderRadius:2,transition:"width .3s"}}/></div>
        {/* Flip card */}
        <div onClick={()=>{play("flip");setStudyFlipped(f=>!f);}} style={{...K(),cursor:"pointer",textAlign:"center",minHeight:230,display:"flex",flexDirection:"column",justifyContent:"center",animation:"sIn .3s ease",border:`0.5px solid ${lv.br}`,background:studyFlipped?lv.bg:T.s2,userSelect:"none"}}>
          {!studyFlipped?(
            <>
              <div style={{fontSize:11,fontWeight:600,color:lv.tx,letterSpacing:".07em",textTransform:"uppercase",marginBottom:12}}>{q.cat}</div>
              <div style={{direction:"rtl",fontSize:24,fontWeight:700,fontFamily:"Cairo,sans-serif",color:T.txt,lineHeight:1.7,animation:"pop .2s ease"}}>{q.ar}</div>
              <p style={{fontSize:12,color:T.m,marginTop:12}}>👆 اضغط لتشوف الإجابة والنطق</p>
              <p style={{fontSize:11,color:T.m,marginTop:4,opacity:.6}}>Space / Enter to flip</p>
            </>
          ):(
            <div style={{animation:"pop .25s ease"}}>
              <div style={{fontSize:11,fontWeight:600,color:lv.tx,letterSpacing:".07em",textTransform:"uppercase",marginBottom:10}}>{q.cat} ✓</div>
              <WordTrans text={q.en} T={T} lv={lv}/>
              {q.pron&&<div style={{marginTop:12}}><PronBox pron={q.pron} T={T} lv={lv} en={q.en}/></div>}
              <p style={{fontSize:11,color:T.m,marginTop:12,opacity:.7}}>👆 اضغط على الكلمة لترجمتها · اضغط 🔊 للنطق</p>
              <p style={{fontSize:11,color:T.m,marginTop:4,opacity:.7}}>👆 اضغط للرجوع / Tap to flip back</p>
            </div>
          )}
        </div>
        {/* Navigation */}
        <div style={{display:"flex",gap:10,marginBottom:10}}>
          <button style={{...Btn(T.s1,T.txt,{flex:1,border:`0.5px solid ${T.bdS}`}),opacity:studyIdx===0?.35:1}} className="qbtn" disabled={studyIdx===0} onClick={()=>{setStudyIdx(i=>i-1);setStudyFlipped(false);}}>← Prev</button>
          <button style={Btn(doneAll?lv.fill:T.s1,doneAll?"#fff":T.txt,{flex:1,border:doneAll?"none":`0.5px solid ${T.bdS}`})} className="qbtn" onClick={()=>{if(!doneAll){setStudyIdx(i=>i+1);setStudyFlipped(false);}else startQuizFromStudy();}}>
            {doneAll?"🚀 Start Quiz →":"Next →"}
          </button>
        </div>
        {/* Dots progress */}
        <div style={{display:"flex",gap:3,justifyContent:"center",flexWrap:"wrap",marginBottom:12}}>
          {Array.from({length:Math.min(qs.length,25)},(_,i)=>{const dotIdx=Math.floor(i/25*qs.length);return(<div key={i} style={{width:6,height:6,borderRadius:"50%",background:i<=Math.floor(studyIdx/qs.length*25)?lv.fill:"rgba(128,128,128,.22)",transition:"background .2s"}}/>);})}
        </div>
        <button style={Btn(lv.fill)} className="qbtn" onClick={startQuizFromStudy}>🚀 أنا مستعد! Start Quiz Now ({qs.length} questions)</button>
        <p style={{textAlign:"center",fontSize:11,color:T.m,marginTop:8}}>← → arrow keys or A/D to navigate · Space/Enter to flip</p>
      </div>
    );
  }

  // ── QUIZ ──────────────────────────────────────────────────────
  if(view==="quiz"&&qs[qi]){
    const q=qs[qi],isMCQ=q.qt==="m",isPuzzle=q.qt==="p";
    const pp=(qi/qs.length*100).toFixed(1);
    const mcqDone=isMCQ&&sel!==null,mcqOk=isMCQ&&sel===q.c;
    const wDone=(!isMCQ&&!isPuzzle)&&(res!==null||showA),wOk=(!isMCQ&&!isPuzzle)&&(res==="ok"||res==="close");
    const done=mcqDone||wDone||puzzleDone,corr=mcqOk||wOk||puzzleOk;
    const gSt=(i)=>sel===null?"idle":i===q.c?"ok":i===sel?"bad":"dim";
    const wXp=showA?0:(res==="ok"||res==="close")?(hl===0?XP.wrt0:hl===1?XP.wrt1:XP.wrt2):0;
    return(
      <div style={W}><style>{CSS}</style>
        {/* Exit confirm overlay */}
        {exitConfirm&&<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,animation:"fUp .2s ease"}}>
          <div style={{background:T.s2,borderRadius:16,padding:"1.75rem",maxWidth:300,width:"88%",textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}}>
            <div style={{fontSize:34,marginBottom:10}}>🚪</div>
            <h3 style={{fontSize:16,fontWeight:700,color:T.txt,marginBottom:8}}>Exit quiz?</h3>
            <p style={{fontSize:13,color:T.m,marginBottom:6}}>Your current session progress will be lost.</p>
            <p style={{fontSize:12,color:T.m,marginBottom:20,fontFamily:"Cairo,sans-serif",direction:"rtl"}}>هتعوز تخرج من الكويز؟</p>
            <div style={{display:"flex",gap:10}}>
              <button style={Btn(T.s1,T.txt,{flex:1,border:`0.5px solid ${T.bdS}`})} className="qbtn" onClick={()=>setExitConfirm(false)}>↩ Continue</button>
              <button style={Btn("#EF4444","#fff",{flex:1})} className="qbtn" onClick={()=>{setExitConfirm(false);setView("home");}}>Exit ✕</button>
            </div>
          </div>
        </div>}
        {/* Top bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:".6rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button className="ibtn" style={{color:"#EF4444",fontSize:13,fontWeight:600,padding:"4px 8px",border:`0.5px solid rgba(239,68,68,.3)`,borderRadius:7,background:"rgba(239,68,68,.07)"}} onClick={()=>setExitConfirm(true)}>✕ Exit</button>
            <span style={{fontSize:11,fontWeight:700,color:lv.tx,background:lv.bg,border:`0.5px solid ${lv.br}`,padding:"2px 8px",borderRadius:20}}>{isCS?"💻":"🗣️"} {lvDay}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <Hearts n={hrt}/>
            <button className="ibtn" style={{fontSize:15,color:T.m}} onClick={()=>{const n=!snd;setSnd(n);saveCfg({sound:n});}}>{snd?"🔊":"🔇"}</button>
          </div>
        </div>
        <div style={{height:5,background:T.s1,borderRadius:3,overflow:"hidden",marginBottom:6}}><div style={{height:"100%",width:`${pp}%`,background:lv.fill,borderRadius:3,transition:"width .35s"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
          <span style={{fontSize:11,color:T.m}}>Q {qi+1}/{qs.length}</span>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {stkPop&&<span key={stkPop} style={{fontSize:12,fontWeight:700,color:"#F59E0B",animation:"cUp .3s ease"}}>{stkPop}</span>}
            {xpPop&&<span key={xpPop+qi} style={{fontSize:12,fontWeight:700,color:lv.tx,animation:"cUp .3s ease"}}>{xpPop}</span>}
            <span key={ok} style={{fontSize:13,fontWeight:700,color:lv.tx,animation:"cUp .2s ease"}}>✓ {ok}</span>
          </div>
        </div>
        <Ad idx={topAd.current} T={T} sm/>
        <div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
          <span style={{fontSize:10,fontWeight:700,color:isMCQ?"#3B82F6":isPuzzle?"#F59E0B":"#8B5CF6",background:isMCQ?"rgba(59,130,246,.1)":isPuzzle?"rgba(245,158,11,.1)":"rgba(139,92,246,.1)",border:`0.5px solid ${isMCQ?"rgba(59,130,246,.28)":isPuzzle?"rgba(245,158,11,.28)":"rgba(139,92,246,.28)"}`,padding:"2px 8px",borderRadius:20}}>{isMCQ?"⊙ MCQ":isPuzzle?"🧩 PUZZLE":"✍️ TYPE"}</span>
          <span style={{fontSize:10,color:T.m}}>{q.cat}</span>
        </div>
        <div key={qKey} style={{...K(),animation:"sIn .3s ease",position:"relative",overflow:"hidden",background:lv.bg,border:`0.5px solid ${lv.br}`}}>
          <div style={{direction:"rtl",textAlign:"center",fontSize:24,fontWeight:700,lineHeight:1.7,color:T.txt,fontFamily:"'Cairo',sans-serif",padding:".4rem 0"}}>{q.ar}</div>
          <p style={{textAlign:"center",fontSize:12,color:T.m,marginTop:4,fontFamily:"Cairo,sans-serif"}}>{isMCQ?"اختار الترجمة الصح":isPuzzle?"رتّب الكلمات عشان تكوّن الجملة":"اكتب الترجمة الصح بالإنجليزي"}</p>
          {ptcl&&PC.map((c,i)=><div key={i} style={{position:"absolute",top:"50%",left:`${4+i*12}%`,width:10,height:10,borderRadius:"50%",background:c,animation:`ptc .7s ease ${i*.04}s forwards`,pointerEvents:"none"}}/>)}
        </div>
        {isMCQ&&<div key={`m${qKey}`} style={{animation:"fUp .28s ease .06s both"}}>
          {q.opts.map((opt,i)=>{const st=gSt(i),sh=shkIdx===i;return(<button key={i} onClick={()=>handleMCQ(i)} disabled={mcqDone} className="qbtn" style={{width:"100%",textAlign:"left",padding:".82rem 1rem",borderRadius:10,fontSize:15,marginBottom:9,display:"flex",alignItems:"flex-start",gap:10,cursor:mcqDone?"default":"pointer",border:`0.5px solid ${st==="ok"?"#22C55E":st==="bad"?"#EF4444":T.bdS}`,background:st==="ok"?"rgba(34,197,94,.13)":st==="bad"?"rgba(239,68,68,.13)":T.s1,color:st==="ok"?"#16A34A":st==="bad"?"#DC2626":T.txt,opacity:st==="dim"?.28:1,animation:sh?"shk .5s ease":st==="ok"?"glo .55s ease":undefined,lineHeight:1.45}}>
            <span style={{width:26,height:26,borderRadius:6,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,fontFamily:"monospace",background:st==="ok"?"#22C55E":st==="bad"?"#EF4444":T.s2,color:st==="ok"||st==="bad"?"#fff":T.s,border:`1px solid ${st==="ok"?"#22C55E":st==="bad"?"#EF4444":T.bdS}`,boxShadow:st==="idle"?`0 2px 0 ${T.bdS}`:"none",marginTop:1}}>{["W","A","S","D"][i]}</span>
            <span style={{flex:1}}>{opt}</span>
            {st==="ok"&&<span style={{fontSize:15,marginTop:3}}>✓</span>}
            {st==="bad"&&<span style={{fontSize:15,marginTop:3}}>✗</span>}
          </button>);})}
          {!mcqDone&&<div style={{display:"flex",justifyContent:"center",gap:12,marginTop:4,opacity:.35}}>{["W","A","S","D"].map((k,i)=><span key={i} style={{display:"flex",alignItems:"center",gap:3,fontSize:10,color:T.m}}><span style={{background:T.s2,border:`1px solid ${T.bdS}`,borderRadius:3,padding:"0 5px",fontFamily:"monospace",fontSize:10}}>{k}</span>→{["A","B","C","D"][i]}</span>)}</div>}
          {mcqDone&&<div style={{animation:"fUp .2s ease"}}><PronBox pron={q.pron} T={T} lv={lv} en={q.en}/><div style={{padding:".75rem 1rem",borderRadius:10,margin:"10px 0",background:mcqOk?"rgba(34,197,94,.12)":"rgba(239,68,68,.12)",border:`0.5px solid ${mcqOk?"#22C55E":"#EF4444"}`,color:mcqOk?"#16A34A":"#DC2626",fontSize:14,fontWeight:600,lineHeight:1.5}}>{mcqOk?`✓ Correct! ممتاز! (+${XP.mcq} XP) 🎉`:`✗ Wrong! The answer is: "${q.en}"`}</div><button style={Btn(lv.fill)} className="qbtn" onClick={()=>advance(mcqOk?XP.mcq:0)}>{qi+1>=qs.length?"See results →":"Next →"} <span style={{fontSize:12,opacity:.7}}>(Enter)</span></button></div>}
        </div>}
        {!isMCQ&&<div key={`w${qKey}`} style={{animation:"fUp .28s ease .06s both"}}>
          {hl>0&&!wDone&&<div style={{padding:".6rem 1rem",borderRadius:8,marginBottom:10,background:"rgba(245,158,11,.1)",border:"0.5px solid rgba(245,158,11,.32)",color:"#D97706",fontSize:14,letterSpacing:1.5,fontFamily:"monospace",animation:"hnt .6s ease"}}>💡 {mkHint(q.en,hl)}</div>}
          {!wDone&&<><div style={{animation:shkIdx===-1?"shk .5s ease":undefined}}><input ref={inRef} value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleWrite()} placeholder="Type the English translation here..." dir="ltr" className="inp" style={{width:"100%",padding:".9rem 1rem",borderRadius:10,border:`1.5px solid ${T.bdS}`,background:T.s1,color:T.txt,fontSize:16,boxSizing:"border-box",transition:"border-color .2s",marginBottom:10,fontFamily:"system-ui"}}/></div>
          <button style={Btn(lv.fill)} className="qbtn" onClick={handleWrite} disabled={!inp.trim()}>Check ✓ <span style={{fontSize:12,opacity:.7}}>(Enter)</span></button>
          <div style={{display:"flex",gap:8,marginTop:9}}>{hl<2&&<button style={{...Btn("rgba(245,158,11,.12)","#D97706",{flex:1,border:"0.5px solid rgba(245,158,11,.3)"}),fontSize:13}} className="qbtn" onClick={handleHint}>💡 Hint {hl+1}/2</button>}{(tries>=2||hl>=2)&&!showA&&<button style={{...Btn("rgba(239,68,68,.1)","#DC2626",{flex:1,border:"0.5px solid rgba(239,68,68,.28)"}),fontSize:13}} className="qbtn" onClick={handleShowA}>👁 Show answer</button>}</div></>}
          {wDone&&<div style={{animation:"fUp .2s ease"}}><PronBox pron={q.pron} T={T} lv={lv} en={q.en}/><div style={{padding:".75rem 1rem",borderRadius:10,margin:"10px 0",background:wOk?"rgba(34,197,94,.12)":"rgba(239,68,68,.12)",border:`0.5px solid ${wOk?"#22C55E":"#EF4444"}`,color:wOk?"#16A34A":"#DC2626",fontSize:14,fontWeight:600,lineHeight:1.5}}>{showA?`👁 Answer: "${q.en}"`:res==="ok"?`✓ Perfect! (+${wXp} XP) 🎉`:res==="close"?`✓ Close! Answer: "${q.en}" (+${wXp} XP) 👍`:`✗ Wrong! Answer: "${q.en}"`}</div>{!wOk&&!showA&&tries<=3&&<button style={{...Btn("rgba(59,130,246,.1)","#2563EB",{border:"0.5px solid rgba(59,130,246,.28)",marginBottom:10}),fontSize:14}} className="qbtn" onClick={()=>{setRes(null);setInp("");}}>🔄 Try again</button>}<button style={Btn(lv.fill)} className="qbtn" onClick={()=>advance(wOk?wXp:0)}>{qi+1>=qs.length?"See results →":"Next →"} <span style={{fontSize:12,opacity:.7}}>(Enter)</span></button></div>}
        </div>}
        {/* ── PUZZLE MODE ── */}
        {isPuzzle&&!puzzleDone&&<div style={{animation:"fUp .28s ease .06s both",marginBottom:12}}>
          {/* Answer zone */}
          <div style={{...K({marginBottom:12,minHeight:50}),display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",justifyContent:"center",background:T.s1,border:`2px dashed ${T.bdS}`,padding:puzzleAnswer.length?".7rem":"1.2rem",transition:"all .2s"}}>
            {puzzleAnswer.length===0&&<span style={{fontSize:13,color:T.m,fontFamily:"Cairo,sans-serif"}}>اضبط الكلمات هنا 👇</span>}
            {puzzleAnswer.map((chip,i)=>(
              <span key={chip.id} onClick={()=>{setPuzzleAnswer(a=>a.filter((_,j)=>j!==i));setPuzzleChips(ch=>ch.map(c=>c.id===chip.id?{...c,used:false}:c));}}
                style={{padding:"7px 14px",borderRadius:10,background:lv.fill,color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",animation:"pop .15s ease",boxShadow:`0 2px 6px ${lv.fill}44`,userSelect:"none",transition:"transform .1s"}}
                onMouseDown={e=>e.currentTarget.style.transform="scale(.92)"}
                onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>{chip.word}</span>
            ))}
          </div>
          {/* Word bank */}
          <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:12}}>
            {puzzleChips.map(chip=>(
              <span key={chip.id} onClick={()=>{if(!chip.used)setPuzzleAnswer(a=>[...a,chip]);setPuzzleChips(ch=>ch.map(c=>c.id===chip.id?{...c,used:true}:c));}}
                style={{padding:"7px 14px",borderRadius:10,background:chip.used?"rgba(128,128,128,.1)":T.s2,color:chip.used?"rgba(128,128,128,.3)":T.txt,fontSize:14,fontWeight:600,cursor:chip.used?"default":"pointer",border:`1.5px solid ${chip.used?"transparent":T.bdS}`,opacity:chip.used?.35:1,transition:"all .15s",userSelect:"none",transform:chip.used?"scale(.9)":"none"}}>{chip.word}</span>
            ))}
          </div>
          <button style={Btn(lv.fill)} className="qbtn" onClick={()=>{
            const userStr=puzzleAnswer.map(c=>c.word).join(" ");
            const ok=userStr.toLowerCase().trim()===q.en.toLowerCase().trim();
            setPuzzleOk(ok);setPuzzleDone(true);
            if(!ok)setHrt(h=>Math.max(0,h-1));
            if(ok){play("ok");setPtcl(true);setTimeout(()=>setPtcl(false),700);}
            else{play("no");}
          }} disabled={puzzleAnswer.length===0}>Check ✓</button>
        </div>}
        {isPuzzle&&puzzleDone&&<div style={{animation:"fUp .2s ease",marginBottom:12}}>
          <PronBox pron={q.pron} T={T} lv={lv} en={q.en}/>
          <div style={{padding:".75rem 1rem",borderRadius:10,margin:"10px 0",background:puzzleOk?"rgba(34,197,94,.12)":"rgba(239,68,68,.12)",border:`0.5px solid ${puzzleOk?"#22C55E":"#EF4444"}`,color:puzzleOk?"#16A34A":"#DC2626",fontSize:14,fontWeight:600,lineHeight:1.5}}>
            {puzzleOk?`✓ Perfect! 🎉 (+${XP.wrt0} XP)`:`✗ Wrong! The correct sentence is:\n"${q.en}"`}
          </div>
          <button style={Btn(lv.fill)} className="qbtn" onClick={()=>advance(puzzleOk?XP.wrt0:0)}>{qi+1>=qs.length?"See results →":"Next →"} <span style={{fontSize:12,opacity:.7}}>(Enter)</span></button>
        </div>}
        {qi>0&&qi%12===0&&<div style={{marginTop:10}}><Ad idx={botAd.current} T={T} sm/></div>}
      </div>
    );
  }

  // ── RESULTS ──────────────────────────────────────────────────
  if(view==="results"){
    const dd=curProg.day-1,pd=Math.round(fOk/Math.max(qs.length,1)*100);
    const g=pd>=90?{e:"🏆",ar:"ممتاز يا بطل! 🎉"}:pd>=75?{e:"⭐",ar:"عظيم! استمر!"}:pd>=60?{e:"👍",ar:"كويس! ركز أكتر"}:{e:"💪",ar:"لا تستسلم! التكرار مفتاح"};
    const tot=curProg.totalAnswered,an=tot>0?Math.round(curProg.totalCorrect/tot*100):0;
    const uniqueWrong=[...new Map(wrongQs.map(q=>[q.ar,q])).values()];
    return(<div style={W}><style>{CSS}</style>
      <div style={{...K(),textAlign:"center",background:lv.bg,border:`0.5px solid ${lv.br}`,animation:"pop .4s ease"}}>
        <div style={{fontSize:44,marginBottom:6}}>{g.e}</div>
        <h2 style={{fontSize:19,fontWeight:700,color:T.txt,marginBottom:4}}>{isCS?"💻 CS ":""}Day {dd} complete!</h2>
        <div style={{direction:"rtl",fontSize:17,fontWeight:700,color:lv.tx,fontFamily:"'Cairo',sans-serif",lineHeight:1.6}}>{g.ar}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[{v:`${fOk}/${qs.length}`,l:"score",c:lv.tx},{v:`+${fXp}`,l:"XP earned",c:"#F59E0B"},{v:`${pd}%`,l:"accuracy"}].map((s,i)=>(
          <div key={i} style={{...K(),textAlign:"center",marginBottom:0}}><div style={{fontSize:17,fontWeight:700,color:s.c||T.txt}}>{s.v}</div><div style={{fontSize:11,color:T.m,marginTop:2}}>{s.l}</div></div>
        ))}
      </div>
      {/* Wrong answers review */}
      {uniqueWrong.length>0&&<div style={{...K(),border:`0.5px solid rgba(239,68,68,.3)`,background:"rgba(239,68,68,.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showWrong?12:0}}>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:16}}>❌</span>
            <div><div style={{fontSize:13,fontWeight:700,color:"#DC2626"}}>{uniqueWrong.length} Wrong Answer{uniqueWrong.length>1?"s":""}</div><div style={{fontSize:11,color:T.m}}>المراجعة قبل ما تعيد</div></div>
          </div>
          <button onClick={()=>setShowWrong(w=>!w)} style={{background:"rgba(239,68,68,.1)",border:"0.5px solid rgba(239,68,68,.3)",color:"#DC2626",borderRadius:8,padding:"4px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>{showWrong?"Hide ▲":"Review ▼"}</button>
        </div>
        {showWrong&&<div style={{animation:"fUp .25s ease"}}>
          {uniqueWrong.map((q,i)=>(
            <div key={i} style={{background:T.s1,borderRadius:10,padding:".8rem 1rem",marginBottom:8,border:`0.5px solid ${T.bd}`}}>
              <div style={{direction:"rtl",fontSize:16,fontWeight:600,fontFamily:"Cairo,sans-serif",color:T.txt,marginBottom:6}}>{q.ar}</div>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:q.pron?6:0}}>
                <span style={{fontSize:12,fontWeight:700,color:"#22C55E",background:"rgba(34,197,94,.1)",border:"0.5px solid rgba(34,197,94,.3)",padding:"2px 8px",borderRadius:20}}>✓</span>
                <span style={{fontSize:14,fontWeight:600,color:T.txt}}>{q.en}</span>
              </div>
              {q.pron&&<div style={{direction:"rtl",fontSize:15,fontWeight:600,fontFamily:"Cairo,sans-serif",color:lv.tx,background:lv.bg,border:`0.5px solid ${lv.br}`,borderRadius:7,padding:".35rem .8rem",display:"inline-flex",alignItems:"center",gap:6}}><span>🔊</span><span>{q.pron}</span></div>}
              {q.userAns&&<div style={{fontSize:11,color:"#DC2626",marginTop:5,fontStyle:"italic"}}>You answered: "{q.userAns}"</div>}
            </div>
          ))}
          <button style={{...Btn(lv.fill,"#fff",{marginTop:4}),fontSize:13}} className="qbtn" onClick={()=>{setPractice(true);setQs(uniqueWrong);setStudyIdx(0);setStudyFlipped(false);setQi(0);setSel(null);setInp("");setRes(null);setHl(0);setShowA(false);setTries(0);setOk(0);setSXp(0);setHrt(5);setCStreak(0);setShkIdx(null);setWrongQs([]);setShowWrong(false);setQKey(k=>k+1);setView("study");}}>📚 Study these {uniqueWrong.length} again</button>
        </div>}
      </div>}
      <div style={K()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontSize:12,color:T.m}}>Progress</span><span style={{fontSize:12,fontWeight:700,color:lv.tx}}>{tot}/5000</span></div>
        <div style={{height:7,background:T.s1,borderRadius:4,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(tot/5000*100,100).toFixed(1)}%`,background:lv.fill,borderRadius:4}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}><span style={{fontSize:11,color:T.m}}>Accuracy: {an}%</span><span style={{fontSize:11,color:T.m}}>{5000-tot} remaining</span></div>
      </div>
      {curProg.day<=100&&<><button style={Btn(lv.fill)} className="qbtn" onClick={()=>setView("home")}>← Back to home</button><p style={{textAlign:"center",fontSize:12,color:T.m,marginTop:7}}>Next: {QDAY(curProg.day)} level</p></>}
      <div style={{marginTop:12}}><Ad idx={botAd.current} T={T}/></div>
    </div>);
  }

  if(view==="err")return(<div style={{...W,display:"flex",alignItems:"center",justifyContent:"center"}}><style>{CSS}</style><div style={{textAlign:"center"}}><div style={{fontSize:44,marginBottom:12}}>⚠️</div><h2 style={{fontSize:18,fontWeight:700,color:T.txt,marginBottom:8}}>Something went wrong</h2><p style={{color:T.m,fontSize:13,maxWidth:380,margin:"0 auto 1rem",lineHeight:1.6}}>{errMsg}</p>{errMsg.includes("GEMINI_API_KEY")&&<div style={{...K(),textAlign:"left",maxWidth:380,margin:"0 auto 1.5rem",background:"rgba(59,130,246,.06)",border:"0.5px solid rgba(59,130,246,.2)"}}><p style={{fontSize:12,color:T.txt,fontWeight:600,marginBottom:6}}>How to fix:</p><ol style={{fontSize:12,color:T.m,paddingLeft:16,lineHeight:2}}><li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" style={{color:"#3B82F6"}}>Google AI Studio</a></li><li>Create a free API key</li><li>In Vercel → Project → Settings → Environment Variables</li><li>Add <code style={{background:T.s1,padding:"1px 5px",borderRadius:3}}>GEMINI_API_KEY</code> with your key</li><li>Redeploy the project</li></ol></div>}<button style={Btn(LC.Easy.fill)} className="qbtn" onClick={()=>startQuiz(false,isCS)}>Try again</button></div></div>);

  // ── GRAMMAR TOPICS LIST ─────────────────────────────
  if(view==="grammar")return(
    <div style={W}><style>{CSS}</style>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button className="ibtn" style={{fontSize:20,color:T.m}} onClick={()=>setView("home")}>←</button>
        <span style={{fontSize:22}}>📖</span>
        <h2 style={{fontSize:18,fontWeight:700,color:T.txt}}>قواعد الإنجليزي</h2>
      </div>
      <p style={{fontSize:13,color:T.m,marginBottom:16,lineHeight:1.6}}>شروحات مفصّلة لكل قاعدة بالعربية — من الأساسيات للقواعد المتقدمة. اضغط على أي موضوع تبدأ تتعلم.</p>
      {GRAMMAR_CATS.map(cat=>{
        const topics=GRAMMAR_TOPICS.filter(t=>t.cat===cat.id);
        return(
          <div key={cat.id} style={{marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:18}}>{cat.icon}</span>
              <h3 style={{fontSize:15,fontWeight:700,color:cat.color}}>{cat.label}</h3>
              <span style={{fontSize:11,color:T.m,marginInlineStart:"auto"}}>{topics.length} topics</span>
            </div>
            {topics.map((t,i)=>(
              <div key={t.id} onClick={()=>{setGramTopic(t);setGramSection(0);setView("grammarLesson");}}
                style={{...K(),marginBottom:10,cursor:"pointer",display:"flex",alignItems:"center",gap:12,animation:`fUp .${i+2}s ease`}}>
                <div style={{width:44,height:44,borderRadius:10,background:cat.color+"15",border:`0.5px solid ${cat.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{t.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:700,color:T.txt}}>{t.title}</div>
                  <div style={{fontSize:12,color:T.m,marginTop:2}}>{t.sections.length} قواعد</div>
                </div>
                <span style={{color:T.m,fontSize:16}}>←</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  // ── GRAMMAR LESSON DETAIL ──────────────────────────
  if(view==="grammarLesson"&&gramTopic)return(
    <div style={W}><style>{CSS}</style>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <button className="ibtn" style={{fontSize:20,color:T.m}} onClick={()=>setView("grammar")}>←</button>
        <span style={{fontSize:20}}>{gramTopic.icon}</span>
        <h2 style={{fontSize:17,fontWeight:700,color:T.txt}}>{gramTopic.title}</h2>
      </div>
      {/* Intro */}
      <div style={{...K(),background:LC.Easy.bg,border:`0.5px solid ${LC.Easy.br}`,marginBottom:14}}>
        <p style={{fontSize:13,color:T.txt,lineHeight:1.8,margin:0,fontFamily:"Cairo,sans-serif"}}>{gramTopic.intro}</p>
      </div>
      {/* Section tabs */}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:14}}>
        {gramTopic.sections.map((s,i)=>(
          <button key={i} onClick={()=>setGramSection(i)}
            style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${i===gramSection?LC.Easy.fill:T.bdS}`,background:i===gramSection?LC.Easy.bg:"transparent",color:i===gramSection?LC.Easy.tx:T.m,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
            {i+1}
          </button>
        ))}
      </div>
      {/* Section content */}
      <div key={gramSection} style={{...K(),animation:"sIn .3s ease",lineHeight:1.9,fontSize:14,color:T.txt,fontFamily:"Cairo,sans-serif"}}>
        <h3 style={{fontSize:16,fontWeight:700,color:LC.Easy.tx,marginBottom:12,borderBottom:`1px solid ${T.bd}`,paddingBottom:8}}>{gramTopic.sections[gramSection].title}</h3>
        <div dangerouslySetInnerHTML={{__html:gramTopic.sections[gramSection].content}}/>
      </div>
      {/* Navigation */}
      <div style={{display:"flex",gap:10,marginTop:14}}>
        {gramSection>0&&<button style={{...Btn(T.s1,T.txt,{flex:1,border:`0.5px solid ${T.bdS}`}),fontSize:13}} className="qbtn" onClick={()=>setGramSection(s=>s-1)}>← السابق</button>}
        {gramSection<gramTopic.sections.length-1&&<button style={{...Btn(LC.Easy.fill,{flex:1}),fontSize:13}} className="qbtn" onClick={()=>setGramSection(s=>s+1)}>التالي →</button>}
        {gramSection===gramTopic.sections.length-1&&<button style={{...Btn(LC.Easy.fill,{flex:1}),fontSize:13}} className="qbtn" onClick={()=>setView("grammar")}>✓ خلصت</button>}
      </div>
    </div>
  );

  // ── LEADERBOARD ──────────────────────────────────
  if(view==="leaderboard")return(
    <div style={W}><style>{CSS}</style>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button className="ibtn" style={{fontSize:20,color:T.m}} onClick={()=>setView("home")}>←</button>
        <span style={{fontSize:22}}>🏆</span>
        <h2 style={{fontSize:18,fontWeight:700,color:T.txt}}>لوحة الصدارة</h2>
      </div>

      {/* My rank card */}
      {leaderboardRank&&<div style={{...K(),background:"linear-gradient(135deg,rgba(245,158,11,.1),rgba(239,68,68,.1))",border:"1px solid rgba(245,158,11,.2)",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:24,fontWeight:800,color:"#F59E0B",minWidth:36,textAlign:"center"}}>#{leaderboardRank}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:700,color:T.txt}}>ترتيبك الحالي</div>
            <div style={{fontSize:11,color:T.m,marginTop:2}}>{prog.xp||0} XP · {prog.bestStreak||0} streak</div>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:uLv.c}}>{uLv.i} {uLv.n}</div>
        </div>
      </div>}

      {/* Loading */}
      {leaderboardLoading&&<div style={{textAlign:"center",padding:40,color:T.m}}>⏳ جاري التحميل...</div>}

      {/* Leaderboard list */}
      {!leaderboardLoading&&leaderboard.length===0&&<div style={{textAlign:"sharp",padding:40,color:T.m}}>لا يوجد مستخدمين بعد</div>}

      {!leaderboardLoading&&leaderboard.map((u,i)=>{
        const isMe=u.id===user?.id;
        return(
          <div key={u.id} style={{...K(),marginBottom:8,display:"flex",alignItems:"center",gap:12,animation:`fUp .${i%10+2}s ease`,border:isMe?`1.5px solid #3B82F6`:undefined,background:isMe?"rgba(59,130,246,.06)":undefined}}>
            <div style={{width:32,textAlign:"center",flexShrink:0}}>
              {u.medal?<span style={{fontSize:22}}>{u.medal}</span>:<span style={{fontSize:14,fontWeight:700,color:T.m}}>#{u.rank}</span>}
            </div>
            <div style={{width:36,height:36,borderRadius:"50%",background:u.photo?"#000":avC(u.name||"?"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0,overflow:"hidden"}}>
              {u.photo?<img src={u.photo} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:(u.name||"?").charAt(0).toUpperCase()}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div onClick={()=>{if(u.username&&!isMe)window.location.hash="#/"+u.username;}} style={{fontSize:13,fontWeight:700,color:isMe?"#3B82F6":T.txt,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",cursor:u.username&&!isMe?"pointer":"default",textDecoration:u.username&&!isMe?"underline":"none",textDecorationColor:"rgba(59,130,246,.4)"}}>{u.name}{isMe?" (أنت)":""}</div>
              <div style={{fontSize:11,color:T.m,marginTop:1,display:"flex",gap:8}}>
                <span>{u.levelIcon} {u.level}</span>
                <span>🔥 {u.bestStreak}</span>
                <span>🎯 {u.accuracy}%</span>
              </div>
            </div>
            <div style={{textAlign:"center",flexShrink:0}}>
              <div style={{fontSize:15,fontWeight:800,color:"#F59E0B"}}>{u.xp.toLocaleString()}</div>
              <div style={{fontSize:9,color:T.m}}>XP</div>
            </div>
          </div>
        );
      })}

      {/* Rank explanation */}
      <div style={{...K(),marginTop:10,background:T.s1}}>
        <div style={{fontSize:12,fontWeight:700,color:T.txt,marginBottom:6}}>📊 كيف بيتحسب الترتيب؟</div>
        <div style={{fontSize:11,color:T.m,lineHeight:1.7}}>
          الترتيب الذكي بيجمع بين:<br/>
          • <b>60%</b> إجمالي النقاط (XP)<br/>
          • <b>20%</b> أفضل سلسلة يومية (Streak)<br/>
          • <b>20%</b> نسبة الإجابة الصحيحة (Accuracy)
        </div>
      </div>
    </div>
  );

  return null;
}
