/* Campus Hub - scripts.js
     Client-side prototype logic using localStorage.
     Provides: events, complaints, attendance, clubs, feedback
*/

console.log('Campus Hub scripts loaded');

// Local storage helpers
const Storage = {
    get(key){try{return JSON.parse(localStorage.getItem(key))||[];}catch(e){return []}},
    set(key,val){localStorage.setItem(key,JSON.stringify(val));}
}

const KEYS = {
    EVENTS: 'campus_events',
    COMPLAINTS: 'campus_complaints',
    ATTENDANCE: 'campus_attendance',
    CLUBS: 'campus_clubs',
    FEEDBACK: 'campus_feedback'
}

function uid(){return Date.now().toString(36) + Math.random().toString(36).slice(2,7)}

function updateDashboardCounts(){
    const elEvent = document.getElementById('count-events');
    const elClubs = document.getElementById('count-clubs');
    const elCompl = document.getElementById('count-complaints');
    const elFb = document.getElementById('count-feedback');
    if(elEvent) elEvent.textContent = Storage.get(KEYS.EVENTS).length;
    if(elClubs) elClubs.textContent = Storage.get(KEYS.CLUBS).length;
    if(elCompl) elCompl.textContent = Storage.get(KEYS.COMPLAINTS).length;
    if(elFb) elFb.textContent = Storage.get(KEYS.FEEDBACK).length;
}

/* ---------------- Events ---------------- */
function addEvent(evt){
    const events = Storage.get(KEYS.EVENTS);
    events.unshift(evt);
    Storage.set(KEYS.EVENTS, events);
}

function renderEvents(){
    const list = document.getElementById('events-list');
    if(!list) return;
    const events = Storage.get(KEYS.EVENTS);
    list.innerHTML = '';
    if(events.length===0){ list.innerHTML = '<div class="small meta">No events yet.</div>'; return }
    events.forEach(e=>{
        const item = document.createElement('div'); item.className='list-item';
        item.innerHTML = `<div><strong>${e.title}</strong><div class="meta">${e.date} • ${e.organizer||'—'}</div><div class="small">${e.desc||''}</div></div>
            <div style="text-align:right">
                <button class="btn secondary" data-id="${e.id}">Delete</button>
            </div>`;
        list.appendChild(item);
    });
    list.querySelectorAll('button[data-id]').forEach(b=>b.addEventListener('click',ev=>{
        const id = b.getAttribute('data-id');
        const remaining = Storage.get(KEYS.EVENTS).filter(x=>x.id!==id);
        Storage.set(KEYS.EVENTS,remaining); renderEvents(); updateDashboardCounts();
    }));
}

/* ---------------- Complaints ---------------- */
function addComplaint(c){ const arr = Storage.get(KEYS.COMPLAINTS); arr.unshift(c); Storage.set(KEYS.COMPLAINTS,arr); }
function renderComplaints(){
    const wrap = document.getElementById('complaints-list'); if(!wrap) return;
    const arr = Storage.get(KEYS.COMPLAINTS);
    wrap.innerHTML=''; if(arr.length===0){ wrap.innerHTML='<div class="small meta">No complaints logged.</div>'; return }
    arr.forEach(c=>{
        const d=document.createElement('div'); d.className='list-item';
        d.innerHTML = `<div><strong>${c.subject}</strong><div class="meta">${c.type} • ${c.date}</div><div class="small">${c.desc}</div></div>
            <div style="text-align:right"><select data-id="${c.id}"><option ${c.status==='Open'?'selected':''}>Open</option><option ${c.status==='In Progress'?'selected':''}>In Progress</option><option ${c.status==='Resolved'?'selected':''}>Resolved</option></select></div>`;
        wrap.appendChild(d);
    });
    wrap.querySelectorAll('select[data-id]').forEach(s=>s.addEventListener('change',ev=>{
        const id = s.getAttribute('data-id');
        const arr = Storage.get(KEYS.COMPLAINTS).map(x=> x.id===id ? {...x,status:s.value} : x);
        Storage.set(KEYS.COMPLAINTS,arr); renderComplaints(); updateDashboardCounts();
    }));
}

/* ---------------- Attendance ---------------- */
function addAttendance(r){ const arr = Storage.get(KEYS.ATTENDANCE); arr.unshift(r); Storage.set(KEYS.ATTENDANCE,arr); }
function renderAttendance(){
    const wrap = document.getElementById('attendance-list'); if(!wrap) return;
    const arr = Storage.get(KEYS.ATTENDANCE);
    wrap.innerHTML=''; if(arr.length===0){ wrap.innerHTML='<div class="small meta">No records yet.</div>'; return }
    arr.slice(0,50).forEach(a=>{
        const d=document.createElement('div'); d.className='list-item';
        d.innerHTML = `<div><strong>${a.name}</strong><div class="meta">${a.date}</div></div><div class="small">${a.status}</div>`;
        wrap.appendChild(d);
    });
}

/* ---------------- Clubs ---------------- */
function addClub(c){ const arr = Storage.get(KEYS.CLUBS); arr.unshift(c); Storage.set(KEYS.CLUBS,arr); }
function renderClubs(){
    const wrap = document.getElementById('clubs-list'); if(!wrap) return;
    const arr = Storage.get(KEYS.CLUBS); wrap.innerHTML=''; if(arr.length===0){ wrap.innerHTML='<div class="small meta">No clubs yet.</div>'; return }
    arr.forEach(cl=>{
        const d=document.createElement('div'); d.className='list-item';
        d.innerHTML = `<div><strong>${cl.name}</strong><div class="meta">${cl.desc||''}</div></div><div><button class="btn secondary" data-join="${cl.id}">Join</button></div>`;
        wrap.appendChild(d);
    });
    wrap.querySelectorAll('button[data-join]').forEach(b=>b.addEventListener('click',ev=>{
        alert('Joined club (prototype): ' + b.getAttribute('data-join'));
    }));
}

/* ---------------- Feedback ---------------- */
function addFeedback(f){ const arr = Storage.get(KEYS.FEEDBACK); arr.unshift(f); Storage.set(KEYS.FEEDBACK,arr); }
function renderFeedback(){
    const wrap = document.getElementById('feedback-list'); if(!wrap) return;
    const arr = Storage.get(KEYS.FEEDBACK); wrap.innerHTML=''; if(arr.length===0){ wrap.innerHTML='<div class="small meta">No feedback yet.</div>'; return }
    arr.forEach(f=>{
        const d=document.createElement('div'); d.className='list-item';
        d.innerHTML = `<div><strong>${f.type}${f.name? ' — ' + f.name: ''}</strong><div class="small">${f.text}</div></div>`;
        wrap.appendChild(d);
    });
}

/* ---------------- Init & DOM hookups ---------------- */
document.addEventListener('DOMContentLoaded',()=>{
    // Ensure keys exist
    Object.values(KEYS).forEach(k=>{ if(!localStorage.getItem(k)) localStorage.setItem(k,JSON.stringify([])); });
    updateDashboardCounts();

    // Events page
    const ef = document.getElementById('event-form'); if(ef){
        ef.addEventListener('submit',e=>{
            e.preventDefault();
            const evt = {id:uid(), title:document.getElementById('event-title').value, date:document.getElementById('event-date').value, organizer:document.getElementById('event-organizer').value, desc:document.getElementById('event-desc').value};
            addEvent(evt); renderEvents(); updateDashboardCounts(); ef.reset(); alert('Event added locally');
        });
        renderEvents();
    }

    // Complaints page
    const cf = document.getElementById('complaint-form'); if(cf){
        cf.addEventListener('submit',e=>{
            e.preventDefault();
            const c = {id:uid(), subject:document.getElementById('complain-subject').value, type:document.getElementById('complain-type').value, desc:document.getElementById('complain-desc').value, status:'Open', date:new Date().toLocaleString()};
            addComplaint(c); renderComplaints(); updateDashboardCounts(); cf.reset(); alert('Complaint logged');
        });
        renderComplaints();
    }

    // Attendance page
    const af = document.getElementById('attendance-form'); if(af){
        af.addEventListener('submit',e=>{
            e.preventDefault();
            const r={id:uid(), name:document.getElementById('att-name').value, date:document.getElementById('att-date').value, status:document.getElementById('att-status').value};
            addAttendance(r); renderAttendance(); af.reset(); alert('Attendance saved');
        });
        renderAttendance();
    }

    // Clubs page
    const clubf = document.getElementById('club-form'); if(clubf){
        clubf.addEventListener('submit',e=>{
            e.preventDefault();
            const c = {id:uid(), name:document.getElementById('club-name').value, desc:document.getElementById('club-desc').value};
            addClub(c); renderClubs(); updateDashboardCounts(); clubf.reset(); alert('Club created');
        });
        renderClubs();
    }

    // Feedback page
    const fb = document.getElementById('feedback-form'); if(fb){
        fb.addEventListener('submit',e=>{
            e.preventDefault();
            const f={id:uid(), name:document.getElementById('fb-name').value, type:document.getElementById('fb-type').value, text:document.getElementById('fb-text').value};
            addFeedback(f); renderFeedback(); updateDashboardCounts(); fb.reset(); alert('Thanks for your feedback');
        });
        renderFeedback();
    }

    // Final dashboard update
    updateDashboardCounts();
});
