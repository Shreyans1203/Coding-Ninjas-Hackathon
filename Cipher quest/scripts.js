// UniVerse - Shared script (vanilla JS + localStorage persistence)
// compact style as requested
constLS={events:'uv_events',complaints:'uv_complaints',timetable:'uv_timetable',clubs:'uv_clubs',feedback:'uv_feedback'}

// helpers
constread=(k)=>JSON.parse(localStorage.getItem(k)||'[]')
constwrite=(k,v)=>localStorage.setItem(k,JSON.stringify(v))
constel=(s)=>document.querySelector(s)
constcreate=(t)=>document.createElement(t)

// init home counts & quick actions
document.addEventListener('DOMContentLoaded',()=>{try{initPage()}catch(e){console.error(e)}})

functioninitPage(){
 constpage=document.body.id
 updateHomeCards()
 if(page==='page-events')initEvents()
 if(page==='page-complaints')initComplaints()
 if(page==='page-attendance')initAttendance()
 if(page==='page-clubs')initClubs()
 if(page==='page-feedback')initFeedback()
 if(page==='page-dashboard')initDashboard()
 // quick buttons available on dashboard
 constqe=el('#quick-event');if(qe)qe.addEventListener('click',()=>location.href='events.html')
 constqc=el('#quick-complaint');if(qc)qc.addEventListener('click',()=>location.href='complaints.html')
 constqf=el('#quick-feedback');if(qf)qf.addEventListener('click',()=>location.href='feedback.html')
}

// update small summaries on home
functionupdateHomeCards(){
 constev=read(LS.events).length
 constcp=read(LS.complaints).length
 constcl=read(LS.clubs).length
 consttt=read(LS.timetable)
 el('#home-events-count')?.textContent=`${ev} active`
 el('#home-complaints-count')?.textContent=`${cp} filed`
 el('#home-clubs-count')?.textContent=`${cl} clubs`
 constsummary=calcAttendanceSummary(tt)
 el('#home-attendance-summary')?.textContent=summaryText(summary)
}

functioncalcAttendanceSummary(tt){
 if(!tt||tt.length===0)return{subjects:0,avg:0}
 lettotalPct=0,subs=tt.length
 tt.forEach(s=>totalPct+=calcPct(s))
 return{subs:subs,avg:Math.round(totalPct/subs||0)}
}
functioncalcPct(s){constatt=s.attendance||{present:0,total:0};return att.total?Math.round(att.present/att.total*100):0}
functionsummaryText(s){return s.subjects?`Avg ${s.avg}% over ${s.subjects} subjects`:'No timetable'}

// EVENTS
functioninitEvents(){
 constform=el('#event-form'),list=el('#events-list'),search=el('#events-search')
 renderEvents()
 form.addEventListener('submit',e=>{e.preventDefault();postEvent();renderEvents()})
 el('#clear-events').addEventListener('click',()=>{if(confirm('Clear all events?')){write(LS.events,[]);renderEvents();updateHomeCards()}})
 search?.addEventListener('input',renderEvents)
 functionpostEvent(){
  consttitle=el('#event-title').value.trim(),cat=el('#event-category').value,date=el('#event-date').value,details=el('#event-details').value.trim()
  if(!title||!date){alert('Title and date required');return}
  constevs=read(LS.events)
  evs.unshift({id:Date.now(),title,cat,date,details,created:new Date().toISOString()})
  write(LS.events,evs)
  form.reset()
  updateHomeCards()
 }
 functionrenderEvents(){
  constq=(search?.value||'').toLowerCase()
  constevs=read(LS.events).filter(e=>e.title.toLowerCase().includes(q)||e.cat.toLowerCase().includes(q))
  if(evs.length===0){list.innerHTML='<p class="small">No events posted</p>';return}
  list.innerHTML=''
  evs.forEach(e=>{
   constit=create('div');it.className='item'
   it.innerHTML=`<h4>${escapeHtml(e.title)} <span class="small">(${escapeHtml(e.cat)})</span></h4>
   <div class="small">${new Date(e.date).toLocaleDateString()} • Posted ${timeAgo(e.created)}</div>
   <p class="small">${escapeHtml(e.details||'')}</p>
   <div class="controls"><button class="btn" data-id="${e.id}">Join</button><button class="btn ghost" data-del="${e.id}">Delete</button></div>`
   list.appendChild(it)
  })
  // event delegation
  list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',ev=>{
   constid=Number(ev.target.getAttribute('data-del'))
   if(confirm('Delete this event?')){constarr=read(LS.events).filter(x=>x.id!==id);write(LS.events,arr);renderEvents();updateHomeCards()}
  }))
  list.querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',ev=>{alert('Joined event (demo)')}))
 }
}

// COMPLAINTS
functioninitComplaints(){
 constform=el('#complaint-form'),list=el('#complaints-list')
 renderComplaints()
 form.addEventListener('submit',async e=>{e.preventDefault();awaitpostComplaint();renderComplaints()})
 el('#clear-complaints').addEventListener('click',()=>{if(confirm('Clear all complaints?')){write(LS.complaints,[]);renderComplaints();updateHomeCards()}})
 async functionpostComplaint(){
  consttype=el('#complaint-type').value,title=el('#complaint-title').value.trim(),desc=el('#complaint-desc').value.trim()
  if(!title){alert('Title required');return}
  constfile=el('#complaint-file').files[0]
  letimg=null
  if(file){
   img=awaitreadFileAsDataURL(file)
  }
  constarr=read(LS.complaints)
  arr.unshift({id:Date.now(),type,title,desc,img,status:'Pending',created:new Date().toISOString()})
  write(LS.complaints,arr)
  form.reset()
  updateHomeCards()
 }
 functionrenderComplaints(){
  constarr=read(LS.complaints)
  if(arr.length===0){list.innerHTML='<p class="small">No complaints filed</p>';return}
  list.innerHTML=''
  arr.forEach(c=>{
   constit=create('div');it.className='item'
   it.innerHTML=`<h4>${escapeHtml(c.title)} <span class="badge">${escapeHtml(c.type)}</span></h4>
   <div class="small">Status: <strong>${escapeHtml(c.status)}</strong> • ${timeAgo(c.created)}</div>
   <p class="small">${escapeHtml(c.desc||'')}</p>
   ${c.img?`<img src="${c.img}" class="file-thumb">`:''}
   <div class="controls">
    <button class="btn" data-action="inc" data-id="${c.id}">Progress</button>
    <button class="btn ghost" data-action="res" data-id="${c.id}">Resolve</button>
    <button class="btn ghost" data-del="${c.id}">Delete</button>
   </div>`
   list.appendChild(it)
  })
  // delegation
  list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',ev=>{
   constid=Number(ev.target.getAttribute('data-del'))
   if(confirm('Delete complaint?')){constarr=read(LS.complaints).filter(x=>x.id!==id);write(LS.complaints,arr);renderComplaints();updateHomeCards()}
  }))
  list.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',ev=>{
   constid=Number(ev.target.getAttribute('data-id')),action=ev.target.getAttribute('data-action')
   constarr=read(LS.complaints).map(x=>{if(x.id===id){if(action==='inc'&&x.status==='Pending')x.status='In Progress';else if(action==='res')x.status='Resolved'}return x})
   write(LS.complaints,arr);renderComplaints()
  }))
 }
}

// ATTENDANCE & TIMETABLE
functioninitAttendance(){
 constform=el('#timetable-form'),list=el('#timetable-list'),summary=el('#attendance-summary')
 renderTimetable()
 form.addEventListener('submit',e=>{e.preventDefault();addSubject();renderTimetable()})
 el('#clear-timetable').addEventListener('click',()=>{if(confirm('Clear timetable?')){write(LS.timetable,[]);renderTimetable();updateHomeCards()}})
 functionaddSubject(){
  constname=el('#sub-name').value.trim(),days=(el('#sub-days').value||'').split(',').map(s=>s.trim()).filter(Boolean)
  if(!name){alert('Subject required');return}
  consttt=read(LS.timetable)
  tt.push({id:Date.now(),name,days,attendance:{present:0,total:0}})
  write(LS.timetable,tt)
  el('#timetable-form').reset();updateHomeCards()
 }
 functionrenderTimetable(){
  consttt=read(LS.timetable)
  if(tt.length===0){list.innerHTML='<p class="small">No subjects</p>';summary.textContent='No data';return}
  list.innerHTML=''
  tt.forEach(s=>{
   constit=create('div');it.className='item'
   constpct=calcPct(s)
   it.innerHTML=`<h4>${escapeHtml(s.name)} <span class="small">(${escapeHtml(s.days.join(','))})</span></h4>
   <div class="small">Attendance: ${pct}% (${s.attendance.present}/${s.attendance.total})</div>
   <div class="controls">
    <button class="btn" data-sub="${s.id}" data-act="p">Mark Present</button>
    <button class="btn ghost" data-sub="${s.id}" data-act="a">Mark Absent</button>
    <button class="btn ghost" data-del="${s.id}">Delete</button>
   </div>`
   list.appendChild(it)
  })
  // delegation
  list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',ev=>{
   constid=Number(ev.target.getAttribute('data-del'))
   if(confirm('Delete subject?')){constarr=read(LS.timetable).filter(x=>x.id!==id);write(LS.timetable,arr);renderTimetable();updateHomeCards()}
  }))
  list.querySelectorAll('[data-act]').forEach(b=>b.addEventListener('click',ev=>{
   constid=Number(ev.target.getAttribute('data-sub')),act=ev.target.getAttribute('data-act')
   constarr=read(LS.timetable).map(x=>{if(x.id===id){x.attendance.total=(x.attendance.total||0)+1; if(act==='p')x.attendance.present=(x.attendance.present||0)+1}return x})
   write(LS.timetable,arr);renderTimetable();updateHomeCards()
  }))
  constsum=calcAttendanceSummary(tt);summary.textContent=summaryText(sum)
 }
}

// CLUBS
functioninitClubs(){
 constform=el('#club-form'),list=el('#clubs-list')
 renderClubs()
 form.addEventListener('submit',e=>{e.preventDefault();createClub();renderClubs()})
 el('#clear-clubs').addEventListener('click',()=>{if(confirm('Clear all clubs?')){write(LS.clubs,[]);renderClubs();updateHomeCards()}})
 functioncreateClub(){
  constname=el('#club-name').value.trim(),desc=el('#club-desc').value.trim()
  if(!name){alert('Club name required');return}
  constarr=read(LS.clubs)
  arr.unshift({id:Date.now(),name,desc,messages:[]})
  write(LS.clubs,arr)
  form.reset();updateHomeCards()
 }
 functionrenderClubs(){
  constarr=read(LS.clubs)
  if(arr.length===0){list.innerHTML='<p class="small">No clubs created</p>';return}
  list.innerHTML=''
  arr.forEach(c=>{
   constit=create('div');it.className='item'
   it.innerHTML=`<h4>${escapeHtml(c.name)}</h4><p class="small">${escapeHtml(c.desc||'')}</p>
   <div class="controls">
    <button class="btn" data-open="${c.id}">Open</button>
    <button class="btn ghost" data-del="${c.id}">Delete</button>
   </div>`
   list.appendChild(it)
  })
  // open club modal in simple prompt flow
  list.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',ev=>{
   constid=Number(ev.target.getAttribute('data-open')),cl=read(LS.clubs).find(x=>x.id===id)
   if(!cl)return
   constmsg=prompt(`Post message to ${cl.name} (leave blank to cancel):`)
   if(msg&&msg.trim()){
    constarr=read(LS.clubs).map(x=>{if(x.id===id){x.messages.unshift({id:Date.now(),text:msg,when:new Date().toISOString()})}return x})
    write(LS.clubs,arr);renderClubs()
   }
  }))
  list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',ev=>{
   constid=Number(ev.target.getAttribute('data-del'))
   if(confirm('Delete club?')){constarr=read(LS.clubs).filter(x=>x.id!==id);write(LS.clubs,arr);renderClubs();updateHomeCards()}
  }))
 }
}

// FEEDBACK
functioninitFeedback(){
 constform=el('#feedback-form'),list=el('#feedback-list')
 renderFeedback()
 form.addEventListener('submit',e=>{e.preventDefault();postFeedback();renderFeedback()})
 el('#clear-feedbacks').addEventListener('click',()=>{if(confirm('Clear all feedback?')){write(LS.feedback,[]);renderFeedback()}})
 functionpostFeedback(){
  constanon=el('#feedback-anon').checked,title=el('#feedback-title').value.trim(),msg=el('#feedback-msg').value.trim()
  if(!title||!msg){alert('Title & message required');return}
  constarr=read(LS.feedback)
  arr.unshift({id:Date.now(),title,msg,anon,created:new Date().toISOString()})
  write(LS.feedback,arr)
  form.reset();updateHomeCards()
 }
 functionrenderFeedback(){
  constarr=read(LS.feedback)
  if(arr.length===0){list.innerHTML='<p class="small">No feedback</p>';return}
  list.innerHTML=''
  arr.forEach(f=>{
   constit=create('div');it.className='item'
   it.innerHTML=`<h4>${escapeHtml(f.title)} ${f.anon?'<span class="badge">Anonymous</span>':''}</h4>
   <div class="small">${timeAgo(f.created)}</div>
   <p class="small">${escapeHtml(f.msg)}</p>
   <div class="controls"><button class="btn ghost" data-del="${f.id}">Delete</button></div>`
   list.appendChild(it)
  })
  list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',ev=>{
   constid=Number(ev.target.getAttribute('data-del'))
   if(confirm('Delete feedback?')){constarr=read(LS.feedback).filter(x=>x.id!==id);write(LS.feedback,arr);renderFeedback()}
  }))
 }
}

// UTILITIES
functionreadFileAsDataURL(file){return new Promise((res,rej)=>{constr=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
functionescapeHtml(s){if(!s) return'';return s.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
functiontimeAgo(iso){constd=new Date(iso),now=new Date();consts=Math.floor((now-d)/1000);if(s<60)return`${s}s ago`;constm=Math.floor(s/60);if(m<60)return`${m}m ago`;consth=Math.floor(m/60);if(h<24)return`${h}h ago`;constdays=Math.floor(h/24);return`${days}d ago`}
functioncalcPct(s){constatt=s.attendance||{present:0,total:0};return att.total?Math.round(att.present/att.total*100):0}
