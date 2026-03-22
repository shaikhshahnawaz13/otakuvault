const SUPA_URL = 'https://xycodhqcfgfgtekiuptx.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5Y29kaHFjZmdmZ3Rla2l1cHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1OTU1NjYsImV4cCI6MjA4OTE3MTU2Nn0.2R2kjHq0r4_Xt-ZbEXBo6NmgW8ttUISOIbQz30r2qvQ';
const sb = supabase.createClient(SUPA_URL, SUPA_KEY);

let currentUser = null;
let currentProfile = null;
let currentAnime = null;
let curStatus = null;
let curRating = 0;
let animeCache = {};
let myListData = [];

const ADMIN_UID = 'b3d04e03-b578-4b7e-b226-113e513216f6';
const ADMIN_EMAIL = 'shaikhshahnwaaz84@gmail.com';

async function checkAdmin(user){
  // Primary: verify via Edge Function (server-side, most secure)
  // Fallback: UID check (still secure — UID is not guessable)
  let isAdmin = false;
  try {
    const {data:{session}} = await sb.auth.getSession();
    const token = session?.access_token;
    if(token){
      const res = await fetch(`${SUPA_URL}/functions/v1/verify-admin`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if(res.ok){
        const data = await res.json();
        isAdmin = data.isAdmin === true;
      } else {
        // Edge function failed — fall back to UID match
        isAdmin = user?.id === ADMIN_UID || user?.email === ADMIN_EMAIL;
      }
    }
  } catch(e) {
    // Network error — fall back to UID match
    isAdmin = user?.id === ADMIN_UID || user?.email === ADMIN_EMAIL;
  }
  const btn = document.getElementById('admin-nav-btn');
  if(btn) btn.style.display = isAdmin ? 'inline-block' : 'none';
  const bnBtn = document.getElementById('bn-admin-btn');
  if(bnBtn) bnBtn.style.display = isAdmin ? 'flex' : 'none';
  if(isAdmin && currentUser) grantAdminAllAchievements();
}

/* ——— AUTH ——— */
function switchAuth(tab) {
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',(tab==='login'&&i===0)||(tab==='signup'&&i===1)));
  document.getElementById('login-form').style.display = tab==='login'?'block':'none';
  document.getElementById('signup-form').style.display = tab==='signup'?'block':'none';
  document.getElementById('auth-err').classList.remove('show');
}
function showAuthErr(msg){const e=document.getElementById('auth-err');e.textContent=msg;e.classList.add('show');}

async function doLogin() {
  let input = document.getElementById('l-email').value.trim();
  const pass = document.getElementById('l-pass').value;
  if(!input||!pass){showAuthErr('Fill in all fields');return;}
  let email = input;
  if(!input.includes('@')){
    // Use secure server-side function — email column not exposed to public queries
    const {data,error:pe} = await sb.rpc('get_email_by_username',{uname:input});
    if(pe||!data){showAuthErr('Username not found — try logging in with your email');return;}
    email = data;
  }
  const {data,error} = await sb.auth.signInWithPassword({email,password:pass});
  if(error){showAuthErr(error.message);return;}
  await loadUser(data.user);
}
async function doSignup() {
  const username = document.getElementById('s-user').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const pass = document.getElementById('s-pass').value;
  if(!username||!email||!pass){showAuthErr('Fill in all fields');return;}
  if(pass.length<6){showAuthErr('Password must be 6+ characters');return;}
  if(!/^[a-zA-Z0-9_]+$/.test(username)){showAuthErr('Username: letters, numbers, underscores only');return;}
  const {data,error} = await sb.auth.signUp({email,password:pass,options:{data:{username}}});
  if(error){showAuthErr(error.message);return;}
  if(data.user && data.session){
    await sb.from('profiles').upsert({id:data.user.id,username},{onConflict:'id'});
    await loadUser(data.user);
  } else if(data.user && !data.session){
    showAuthErr('Check your email to confirm your account, then log in.');
  } else {
    showAuthErr('Something went wrong. Try again.');
  }
}
async function doLogout() {
  if(!confirm('Log out?'))return;
  await sb.auth.signOut();
  currentUser=null;currentProfile=null;
  document.getElementById('app').style.display='none';
  document.getElementById('auth-screen').style.display='flex';
}
async function loadUser(user) {
  currentUser = user;
  const {data:prof} = await sb.from('profiles').select('*').eq('id',user.id).single();
  currentProfile = prof;
  const uname = prof?.username || user.email.split('@')[0];
  document.getElementById('user-name').textContent = uname;
  renderAvatarChip(prof?.avatar_url||null, uname);
  checkAdmin(user); // async — runs in background
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('app').style.display='block';
  loadTrending('airing');
  loadStats();
  await loadMyList();
  await loadAchievements();

  checkAchievements();
}

/* ——— INIT ——— */
(async()=>{
  const {data:{session}} = await sb.auth.getSession();
  if(session?.user) await loadUser(session.user);
})();

/* ——— STATS ——— */
async function loadStats() {
  const [m,t,r,th] = await Promise.all([
    sb.from('profiles').select('id',{count:'exact',head:true}),
    sb.from('anime_list').select('id',{count:'exact',head:true}),
    sb.from('reviews').select('id',{count:'exact',head:true}),
    sb.from('threads').select('id',{count:'exact',head:true})
  ]);
  document.getElementById('stat-members').textContent = m.count||0;
  document.getElementById('stat-tracked').textContent = t.count||0;
  document.getElementById('stat-reviews').textContent = r.count||0;
  document.getElementById('stat-threads').textContent = th.count||0;
}

/* ——— PAGES ——— */
function showPage(id, btn) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  btn.classList.add('active');
  if(id==='threads'){loadThreads();return;}
  if(id==='mylist'){renderMyList('all');return;}
  if(id==='trending'){loadStats();return;}
  if(id==='search'){initSearchPage();return;}
  if(id==='admin'){loadAdminPage();return;}
  if(id==='profile'){loadProfilePage();return;}
}

/* ——— SKELETON ——— */
function skel(cid,n=18){
  const el=document.getElementById(cid);
  el.className='skel-grid';
  el.innerHTML=Array(n).fill(`<div class="skel-card"><div class="skel-img"></div><div class="skel-line"></div><div class="skel-line2"></div></div>`).join('');
}

/* ——— TRENDING ——— */
async function loadTrending(filter='airing', btn=null) {
  if(btn){document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');}
  skel('trending-grid');
  try{
    const r=await fetch(`https://api.jikan.moe/v4/top/anime?filter=${filter}&limit=24&sfw=true`);
    const d=await r.json();
    renderGrid('trending-grid',d.data||[]);
  }catch{document.getElementById('trending-grid').innerHTML='<p style="color:var(--muted);padding:2rem 0">Could not load — check connection</p>';}
}

/* ——— SEARCH ——— */
const SUGGESTIONS=['Naruto','Attack on Titan','One Piece','Demon Slayer','Solo Leveling','Jujutsu Kaisen','Dragon Ball Z','Death Note','Tokyo Revengers','Hunter x Hunter','Fullmetal Alchemist','Bleach','Vinland Saga','Chainsaw Man','Spy x Family'];
function initSearchPage(){
  const chips=document.getElementById('suggestion-chips');
  if(chips&&!chips.children.length){
    SUGGESTIONS.forEach(s=>{
      const c=document.createElement('button');
      c.textContent=s;
      c.style.cssText='background:var(--bg3);border:1px solid var(--border);border-radius:20px;color:var(--muted);font-family:Nunito,sans-serif;font-size:0.78rem;font-weight:700;padding:0.28rem 0.85rem;cursor:pointer;transition:all 0.2s;';
      c.onmouseover=()=>{c.style.color='var(--text)';c.style.borderColor='rgba(230,57,70,0.4)';};
      c.onmouseout=()=>{c.style.color='var(--muted)';c.style.borderColor='var(--border)';};
      c.onclick=()=>{document.getElementById('search-q').value=s;doSearch();};
      chips.appendChild(c);
    });
  }
  if(!document.getElementById('search-popular-grid').children.length) loadSearchPopular();
}
async function loadSearchPopular(){
  skel('search-popular-grid',12);
  try{
    const r=await fetch('https://api.jikan.moe/v4/top/anime?filter=bypopularity&limit=12&sfw=true');
    const d=await r.json();
    renderGrid('search-popular-grid',d.data||[]);
  }catch{}
}
function qs_go(){
  const q=document.getElementById('qs').value.trim();
  if(!q)return;
  document.getElementById('search-q').value=q;
  showPage('search',document.querySelector('[onclick*="search"]'));
  doSearch();
}
async function doSearch(){
  const q=document.getElementById('search-q').value.trim();
  if(!q)return;
  document.getElementById('search-discover').style.display='none';
  const wrap=document.getElementById('search-results-wrap');
  wrap.style.display='block';
  document.getElementById('search-results-title').textContent='RESULTS FOR "'+q.toUpperCase()+'"';
  skel('search-grid',16);
  try{
    const r=await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=24&sfw=true`);
    const d=await r.json();
    if(!d.data?.length){document.getElementById('search-grid').innerHTML='<p style="color:var(--muted);padding:2rem 0">No results found</p>';return;}
    renderGrid('search-grid',d.data);
  }catch{document.getElementById('search-grid').innerHTML='<p style="color:var(--muted);padding:2rem 0">Search failed</p>';}
}

/* ——— RENDER GRID ——— */
function renderGrid(cid, list) {
  const el=document.getElementById(cid);
  el.className='anime-grid';
  const listMap={};myListData.forEach(e=>listMap[e.mal_id]=e);
  const tagMap={watching:'tag-w',completed:'tag-c',plan:'tag-p'};
  const tagLbl={watching:'W',completed:'✓',plan:'P'};
  el.innerHTML=list.map(a=>{
    const e=listMap[a.mal_id];
    const badge=e?`<span class="list-tag ${tagMap[e.status]}">${tagLbl[e.status]}</span>`:'';
    const img=a.images?.jpg?.large_image_url||a.images?.jpg?.image_url||'';
    return `<div class="anime-card" onclick="openAnimeModal(${a.mal_id})">
      ${badge}
      <img src="${img}" alt="${escH(a.title)}" loading="lazy" onerror="this.style.background='var(--bg3)';this.removeAttribute('src')">
      <div class="card-body">
        <div class="card-title">${escH(a.title)}</div>
        <div class="card-meta">
          <span class="score-pill">★ ${a.score||'N/A'}</span>
          <span class="type-lbl">${a.type||''}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ——— MY LIST ——— */
async function loadMyList() {
  if(!currentUser)return;
  const {data}=await sb.from('anime_list').select('*').eq('user_id',currentUser.id).order('created_at',{ascending:false});
  myListData=data||[];
}
function filterMyList(f,btn){
  document.querySelectorAll('#page-mylist .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderMyList(f);
}
function renderMyList(filter) {
  const el=document.getElementById('mylist-container');
  let entries=myListData;
  if(filter!=='all')entries=entries.filter(e=>e.status===filter);
  if(!entries.length){
    el.innerHTML=`<div class="empty"><div class="empty-icon">📭</div><h3>${filter==='all'?'Your list is empty':'Nothing here yet'}</h3><p>Search for anime and add them.</p></div>`;
    return;
  }
  const colors={watching:'#60a5fa',completed:'#4ade80',plan:'#a78bfa'};
  const labels={watching:'Watching',completed:'Completed',plan:'Plan to Watch'};
  el.innerHTML=entries.map(e=>`
    <div class="list-entry" onclick="openAnimeModal(${e.mal_id})">
      <img src="${escH(e.image||'')}" onerror="this.style.background='var(--bg3)';this.removeAttribute('src')">
      <div class="entry-info">
        <div class="entry-title">${escH(e.title)}</div>
        <div class="entry-meta">
          <span style="font-size:0.77rem;font-weight:700;color:${colors[e.status]}">${labels[e.status]}</span>
          ${e.user_rating?`<span style="font-size:0.77rem;color:var(--accent2)">${'★'.repeat(e.user_rating)}${'☆'.repeat(5-e.user_rating)}</span>`:''}
          ${e.type?`<span style="font-size:0.7rem;color:var(--muted)">${e.type}</span>`:''}
        </div>
      </div>
      ${e.mal_score?`<div style="text-align:right;flex-shrink:0"><div style="font-size:0.68rem;color:var(--muted)">MAL</div><div style="font-size:1rem;font-weight:700;color:var(--accent2)">${e.mal_score}</div></div>`:''}
    </div>`).join('');
}

/* ——— ANIME MODAL ——— */
async function openAnimeModal(id) {
  currentAnime=null;curStatus=null;curRating=0;
  document.getElementById('anon-tog').classList.remove('on');
  resetModal();
  document.getElementById('anime-overlay').classList.add('open');
  document.body.style.overflow='hidden';
  let a=animeCache[id];
  if(!a){
    try{
      const r=await fetch(`https://api.jikan.moe/v4/anime/${id}`);
      const d=await r.json();
      a=d.data;animeCache[id]=a;
    }catch{document.getElementById('m-title').textContent='Failed to load';return;}
  }
  currentAnime=a;
  document.getElementById('m-img').src=a.images?.jpg?.large_image_url||a.images?.jpg?.image_url||'';
  document.getElementById('m-title').textContent=a.title;
  const en=a.title_english&&a.title_english!==a.title?a.title_english:'';
  document.getElementById('m-en').textContent=en;
  document.getElementById('m-synopsis').textContent=a.synopsis||'No synopsis available.';
  document.getElementById('m-pills').innerHTML=[
    a.score?`<span class="mpill gold">★ ${a.score}</span>`:'',
    a.type?`<span class="mpill">${a.type}</span>`:'',
    a.episodes?`<span class="mpill">${a.episodes} eps</span>`:'',
    a.status?`<span class="mpill">${a.status}</span>`:'',
    (a.season&&a.year)?`<span class="mpill">${a.season} ${a.year}</span>`:''
  ].join('');
  const entry=myListData.find(e=>e.mal_id===id);
  if(entry){curStatus=entry.status;curRating=entry.user_rating||0;refreshStatusUI();refreshStars();}
  loadCommunityReviews(id);
}
function resetModal(){
  document.getElementById('m-title').textContent='Loading...';
  document.getElementById('m-en').textContent='';
  document.getElementById('m-pills').innerHTML='';
  document.getElementById('m-synopsis').textContent='';
  document.getElementById('m-img').src='';
  document.getElementById('m-review').value='';
  document.getElementById('community-reviews').innerHTML='';
  document.querySelectorAll('.sbtn').forEach(b=>b.className='sbtn');
  document.querySelectorAll('.star').forEach(s=>s.classList.remove('lit'));
}
function closeAnimeModal(){
  document.getElementById('anime-overlay').classList.remove('open');
  document.body.style.overflow='';
  currentAnime=null;
}

/* ——— STATUS / STARS ——— */
function setStatus(s){curStatus=curStatus===s?null:s;refreshStatusUI();}
function refreshStatusUI(){
  document.getElementById('sb-w').className='sbtn'+(curStatus==='watching'?' sw':'');
  document.getElementById('sb-c').className='sbtn'+(curStatus==='completed'?' sc':'');
  document.getElementById('sb-p').className='sbtn'+(curStatus==='plan'?' sp':'');
}
document.getElementById('star-row').addEventListener('click',e=>{
  if(!e.target.classList.contains('star'))return;
  const n=+e.target.dataset.n;
  curRating=curRating===n?0:n;refreshStars();
});
document.getElementById('star-row').addEventListener('mouseover',e=>{
  if(!e.target.classList.contains('star'))return;
  const n=+e.target.dataset.n;
  document.querySelectorAll('.star').forEach(s=>s.classList.toggle('lit',+s.dataset.n<=n));
});
document.getElementById('star-row').addEventListener('mouseout',()=>refreshStars());
function refreshStars(){document.querySelectorAll('.star').forEach(s=>s.classList.toggle('lit',+s.dataset.n<=curRating));}

/* ——— SAVE ANIME ——— */
async function saveAnime(){
  if(!currentAnime||!currentUser)return;
  const id=currentAnime.mal_id;
  const isAnon=document.getElementById('anon-tog').classList.contains('on');
  const reviewText=document.getElementById('m-review').value.trim();
  const upsertData={
    user_id:currentUser.id,mal_id:id,title:currentAnime.title,
    image:currentAnime.images?.jpg?.image_url||'',type:currentAnime.type||'',
    mal_score:currentAnime.score||null,status:curStatus||'plan',user_rating:curRating||null
  };
  const {error}=await sb.from('anime_list').upsert(upsertData,{onConflict:'user_id,mal_id'});
  if(error){toast('Error saving: '+error.message);return;}
  if(reviewText&&curRating){
    const genres = (currentAnime.genres||[]).map(g=>g.name).filter(Boolean);
    await sb.from('reviews').insert({
      user_id:currentUser.id,mal_id:id,anime_title:currentAnime.title,
      anime_image:currentAnime.images?.jpg?.image_url||'',rating:curRating,
      body:reviewText,is_anonymous:isAnon,genres:JSON.stringify(genres)
    });
  }
  await loadMyList();
  await loadAchievements();
  checkAchievements();
  toast(`"${currentAnime.title}" saved!`);
  closeAnimeModal();
}
async function removeFromList(){
  if(!currentAnime||!currentUser)return;
  await sb.from('anime_list').delete().eq('user_id',currentUser.id).eq('mal_id',currentAnime.mal_id);
  await loadMyList();
  toast('Removed from list');
  closeAnimeModal();
}

/* ——— COMMUNITY REVIEWS ——— */
async function loadCommunityReviews(mal_id){
  const el=document.getElementById('community-reviews');
  el.innerHTML='<p style="color:var(--muted);font-size:0.8rem">Loading reviews...</p>';
  const {data}=await sb.from('reviews').select('*,profiles(username)').eq('mal_id',mal_id).order('created_at',{ascending:false}).limit(20);
  if(!data?.length){el.innerHTML='<p style="color:var(--muted);font-size:0.8rem;font-style:italic">No reviews yet. Be the first!</p>';return;}
  el.innerHTML=data.map(r=>{
    const uname=r.is_anonymous?'Anonymous':r.profiles?.username||'User';
    const stars='★'.repeat(r.rating||0)+'☆'.repeat(5-(r.rating||0));
    return `<div class="review-card">
      <div class="rv-header">
        <span class="rv-user ${r.is_anonymous?'rv-anon':''}">${escH(uname)}</span>
        <span class="rv-stars">${stars}</span>
      </div>
      <div class="rv-text">${escH(r.body)}</div>
    </div>`;
  }).join('');
}

/* ——— THREADS ——— */
const THREAD_STARTERS=[
  {title:'Which anime has the best soundtrack of all time?',body:'Naruto, AoT, Demon Slayer — too many bangers. Drop your number one pick.'},
  {title:'Most underrated anime that deserves more attention',body:'Drop your hidden gems here. Anime that flew under the radar but deserves love.'},
  {title:'Who is the greatest anime villain ever written?',body:'Light Yagami, Madara, All For One — make your case.'},
  {title:'Best anime arc of all time',body:'Marineford, Chimera Ant, Mugen Train — what arc had you at the edge of your seat?'},
  {title:'Anime that made you cry',body:'Share the ones that absolutely destroyed you emotionally.'},
];
async function loadThreads(){
  const el=document.getElementById('threads-container');
  const featEl=document.getElementById('threads-featured');
  el.innerHTML='<p style="color:var(--muted)">Loading...</p>';
  const {data}=await sb.from('threads').select('*,profiles(username)').order('created_at',{ascending:false}).limit(40);

  // Featured / hot threads — top 3 by upvotes, or starters if empty
  if(data&&data.length>0){
    const hot=[...data].sort((a,b)=>(b.upvotes||0)-(a.upvotes||0)).slice(0,3);
    featEl.innerHTML=`
      <div style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:0.7rem;">🔥 HOT THREADS</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:0.7rem;">
        ${hot.map(t=>`<div class="thread-card" style="margin-bottom:0;border-color:rgba(244,162,97,0.2);" onclick="openThread(${t.id})">
          <div class="thread-title" style="font-size:0.88rem;">${escH(t.title)}</div>
          <div class="thread-footer" style="margin-top:0.5rem;">
            <span class="meta-chip">💬 ${t.reply_count||0}</span>
            <span class="upvote-btn" style="pointer-events:none;">▲ ${t.upvotes||0}</span>
          </div>
        </div>`).join('')}
      </div>`;
  } else {
    // Show conversation starter suggestions when no threads exist
    featEl.innerHTML=`
      <div style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:0.7rem;">💡 START A CONVERSATION</div>
      <div style="display:flex;flex-direction:column;gap:0.5rem;">
        ${THREAD_STARTERS.map((s,i)=>`<div class="starter-card" data-idx="${i}" style="background:var(--bg3);border:1px dashed rgba(255,255,255,0.1);border-radius:10px;padding:0.8rem 1rem;cursor:pointer;transition:border-color 0.2s;" onmouseover="this.style.borderColor='rgba(230,57,70,0.4)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'" onclick="prefillThread(this.dataset.idx)">
          <div style="font-size:0.88rem;font-weight:700;color:var(--text);margin-bottom:0.2rem;">${escH(s.title)}</div>
          <div style="font-size:0.78rem;color:var(--muted);">${escH(s.body)}</div>
        </div>`).join('')}
      </div>`;
  }

  if(!data?.length){el.innerHTML='';return;}
  el.innerHTML=data.map(t=>{
    const uname=t.is_anonymous?'Anonymous':t.profiles?.username||'User';
    const ago=timeAgo(t.created_at);
    return `<div class="thread-card" onclick="openThread(${t.id})">
      <div class="thread-header">
        <div class="thread-title">${escH(t.title)}</div>
        ${t.anime_title?`<span class="thread-anime-tag">${escH(t.anime_title)}</span>`:''}
      </div>
      ${t.body?`<div class="thread-body">${escH(t.body)}</div>`:''}
      <div class="thread-footer">
        <span class="meta-chip">👤 ${escH(uname)}</span>
        <span class="meta-chip">🕐 ${ago}</span>
        <span class="meta-chip">💬 ${t.reply_count||0} replies</span>
        <button class="upvote-btn" onclick="upvoteThread(event,${t.id},this)">▲ ${t.upvotes||0}</button>
      </div>
    </div>`;
  }).join('');
}
function prefillThread(idx){
  const s=THREAD_STARTERS[+idx];
  if(!s)return;
  openNewThread();
  setTimeout(()=>{
    document.getElementById('t-title').value=s.title;
    document.getElementById('t-body').value=s.body;
  },100);
}
async function openThread(id){
  document.getElementById('threads-list-view').style.display='none';
  document.getElementById('thread-detail').style.display='block';
  const el=document.getElementById('thread-detail-content');
  el.innerHTML='<p style="color:var(--muted)">Loading thread...</p>';
  const {data:t}=await sb.from('threads').select('*,profiles(username)').eq('id',id).single();
  const {data:replies}=await sb.from('thread_replies').select('*,profiles(username)').eq('thread_id',id).order('created_at',{ascending:true});
  const uname=t.is_anonymous?'Anonymous':t.profiles?.username||'User';
  el.innerHTML=`
    <div class="thread-detail-box">
      <div class="td-title">${escH(t.title)}</div>
      <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:0.7rem;">
        <span style="font-size:0.78rem;color:var(--accent2);font-weight:700">${escH(uname)}</span>
        ${t.anime_title?`<span class="thread-anime-tag">${escH(t.anime_title)}</span>`:''}
        <span style="font-size:0.75rem;color:var(--muted)">${timeAgo(t.created_at)}</span>
      </div>
      ${t.body?`<div class="td-body">${escH(t.body)}</div>`:''}
    </div>
    <div style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:0.8rem">${(replies||[]).length} Replies</div>
    <div id="replies-container">
      ${(replies||[]).map(r=>{
        const ru=r.is_anonymous?'Anonymous':r.profiles?.username||'User';
        return `<div class="reply-entry">
          <div class="rv-header">
            <span class="reply-user ${r.is_anonymous?'rv-anon':''}">${escH(ru)}</span>
            <span style="font-size:0.72rem;color:var(--muted)">${timeAgo(r.created_at)}</span>
          </div>
          <div class="reply-text">${escH(r.body)}</div>
        </div>`;
      }).join('')}
    </div>
    <div style="margin-top:1rem">
      <div style="font-size:0.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:0.5rem">Add a Reply</div>
      <textarea class="reply-box" id="reply-input" placeholder="Write your reply..."></textarea>
      <div class="anon-row" style="margin-bottom:0.8rem">
        <div class="toggle" id="reply-anon" onclick="this.classList.toggle('on')"></div>
        <label style="font-size:0.82rem;color:var(--muted)">Post anonymously</label>
      </div>
      <button class="btn-save" onclick="submitReply(${id})">Post Reply</button>
    </div>`;
}
async function submitReply(threadId){
  const body=document.getElementById('reply-input').value.trim();
  if(!body){toast('Write something first!');return;}
  const isAnon=document.getElementById('reply-anon').classList.contains('on');
  await sb.from('thread_replies').insert({thread_id:threadId,user_id:currentUser.id,body,is_anonymous:isAnon});
  await sb.from('threads').update({reply_count:sb.rpc}).eq('id',threadId);
  const {data:cnt}=await sb.from('thread_replies').select('id',{count:'exact',head:true}).eq('thread_id',threadId);
  await sb.from('threads').update({reply_count:cnt?.count||0}).eq('id',threadId);
  toast('Reply posted!');
  await loadAchievements();
  checkAchievements();
  openThread(threadId);
}
function backToThreads(){
  document.getElementById('threads-list-view').style.display='block';
  document.getElementById('thread-detail').style.display='none';
  loadThreads();
}
function openNewThread(){document.getElementById('thread-overlay').classList.add('open');document.body.style.overflow='hidden';}
function closeThreadModal(){document.getElementById('thread-overlay').classList.remove('open');document.body.style.overflow='';}
async function submitThread(){
  const title=document.getElementById('t-title').value.trim();
  if(!title){toast('Title is required');return;}
  const body=document.getElementById('t-body').value.trim();
  const animeStr=document.getElementById('t-anime').value.trim();
  const isAnon=document.getElementById('thread-anon-tog').classList.contains('on');
  await sb.from('threads').insert({user_id:currentUser.id,title,body:body||null,anime_title:animeStr||null,is_anonymous:isAnon});
  closeThreadModal();
  document.getElementById('t-title').value='';
  document.getElementById('t-body').value='';
  document.getElementById('t-anime').value='';
  toast('Thread posted!');
  await loadAchievements();
  checkAchievements();
  loadThreads();
}
async function upvoteThread(e,id,btn){
  e.stopPropagation();
  const {data}=await sb.from('threads').select('upvotes').eq('id',id).single();
  const newVal=(data?.upvotes||0)+1;
  await sb.from('threads').update({upvotes:newVal}).eq('id',id);
  btn.textContent=`▲ ${newVal}`;
  btn.classList.add('voted');
}


/* ——— ADMIN ——— */
let adminReviewsData = [];
let adminAnimeData = [];

async function loadAdminPage(){
  // Stats
  try{
    const [rv,al,us,an] = await Promise.all([
      sb.from('reviews').select('id',{count:'exact',head:true}),
      sb.from('anime_list').select('id',{count:'exact',head:true}),
      sb.from('profiles').select('id',{count:'exact',head:true}),
      sb.from('reviews').select('id',{count:'exact',head:true}).eq('is_anonymous',true)
    ]);
    document.getElementById('a-stat-reviews').textContent = rv.count||0;
    document.getElementById('a-stat-tracked').textContent = al.count||0;
    document.getElementById('a-stat-users').textContent = us.count||0;
    document.getElementById('a-stat-anon').textContent = an.count||0;
  }catch(e){ console.error('admin stats error',e); }

  // Reviews
  try{
    const {data:reviews} = await sb.from('reviews')
      .select('*,profiles(username)')
      .order('created_at',{ascending:false})
      .limit(500);
    adminReviewsData = reviews||[];
    const rb = document.getElementById('admin-reviews-body');
    if(!adminReviewsData.length){
      rb.innerHTML='<tr><td colspan="6" style="color:var(--muted);text-align:center;padding:2rem">No reviews yet</td></tr>';
    } else {
      rb.innerHTML = adminReviewsData.map(r=>`<tr>
        <td>${new Date(r.created_at).toLocaleDateString()}</td>
        <td>${escH(r.is_anonymous?'Anonymous':r.profiles?.username||'—')}</td>
        <td title="${escH(r.anime_title)}">${escH(r.anime_title)}</td>
        <td>${'★'.repeat(r.rating||0)}</td>
        <td title="${escH(r.body)}">${escH(r.body)}</td>
        <td>${r.is_anonymous?'Yes':'No'}</td>
      </tr>`).join('');
    }
  }catch(e){ console.error('admin reviews error',e); }

  // Anime list
  try{
    const {data:alist} = await sb.from('anime_list')
      .select('*,profiles(username)')
      .order('created_at',{ascending:false})
      .limit(500);
    adminAnimeData = alist||[];
    const ab = document.getElementById('admin-animelist-body');
    if(!adminAnimeData.length){
      ab.innerHTML='<tr><td colspan="7" style="color:var(--muted);text-align:center;padding:2rem">No entries yet</td></tr>';
    } else {
      ab.innerHTML = adminAnimeData.map(a=>`<tr>
        <td>${new Date(a.created_at).toLocaleDateString()}</td>
        <td>${escH(a.profiles?.username||'—')}</td>
        <td title="${escH(a.title)}">${escH(a.title)}</td>
        <td>${escH(a.type||'—')}</td>
        <td>${escH(a.status||'—')}</td>
        <td>${a.user_rating?'★'.repeat(a.user_rating):'—'}</td>
        <td>${a.mal_score||'—'}</td>
      </tr>`).join('');
    }
  }catch(e){ console.error('admin anime error',e); }
}

function adminTab(tab, btn){
  document.querySelectorAll('#page-admin .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('admin-reviews-section').style.display = tab==='reviews'?'block':'none';
  document.getElementById('admin-animelist-section').style.display = tab==='animelist'?'block':'none';
}

function exportExcel(type){
  const wb = XLSX.utils.book_new();
  let ws, filename;
  if(type==='reviews'){
    const rows = adminReviewsData.map(r=>({
      Date: new Date(r.created_at).toLocaleDateString(),
      Username: r.is_anonymous?'Anonymous':r.profiles?.username||'Unknown',
      Anime: r.anime_title,
      Rating: r.rating||0,
      Review: r.body,
      Anonymous: r.is_anonymous?'Yes':'No'
    }));
    ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{wch:12},{wch:18},{wch:28},{wch:8},{wch:50},{wch:10}];
    filename = 'otakuvault_reviews.xlsx';
  } else {
    const rows = adminAnimeData.map(a=>({
      Date: new Date(a.created_at).toLocaleDateString(),
      Username: a.profiles?.username||'Unknown',
      Anime: a.title,
      Type: a.type||'',
      Status: a.status,
      'User Rating': a.user_rating||'',
      'MAL Score': a.mal_score||''
    }));
    ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{wch:12},{wch:18},{wch:30},{wch:10},{wch:12},{wch:12},{wch:10}];
    filename = 'otakuvault_animelist.xlsx';
  }
  XLSX.utils.book_append_sheet(wb, ws, type==='reviews'?'Reviews':'Anime List');
  XLSX.writeFile(wb, filename);
  toast('Downloading '+filename);
}

/* ——— ACHIEVEMENTS ENGINE ——— */
let allAchievements = [];
let userAchievements = [];
let achFilter = 'all';

async function loadAchievements(){
  const [achRes, userRes] = await Promise.all([
    sb.from('achievements').select('*').order('sort_order'),
    sb.from('user_achievements').select('*').eq('user_id', currentUser.id)
  ]);
  allAchievements = achRes.data||[];
  userAchievements = userRes.data||[];
}

async function checkAchievements(){
  if(!currentUser) return;
  const [revRes, trackRes, threadRes, replyRes] = await Promise.all([
    sb.from('reviews').select('id,genres').eq('user_id', currentUser.id),
    sb.from('anime_list').select('id,status').eq('user_id', currentUser.id),
    sb.from('threads').select('id').eq('user_id', currentUser.id),
    sb.from('thread_replies').select('id').eq('user_id', currentUser.id)
  ]);
  const reviews = revRes.data||[];
  const tracked = trackRes.data||[];
  const threads = threadRes.data||[];
  const replies = replyRes.data||[];
  const completed = tracked.filter(t=>t.status==='completed').length;
  const earned = new Set((userAchievements||[]).map(u=>u.achievement_id));

  // Count genres across reviews
  const genreCounts = {};
  reviews.forEach(r=>{
    const gs = Array.isArray(r.genres) ? r.genres : (JSON.parse(r.genres||'[]'));
    gs.forEach(g=>{ genreCounts[g]=(genreCounts[g]||0)+1; });
  });
  const uniqueGenresReviewed = Object.keys(genreCounts).length;

  const checks = [
    {id:'first_review',    pass: reviews.length>=1},
    {id:'review_10',       pass: reviews.length>=10},
    {id:'review_25',       pass: reviews.length>=25},
    {id:'review_50',       pass: reviews.length>=50},
    {id:'track_10',        pass: tracked.length>=10},
    {id:'track_50',        pass: tracked.length>=50},
    {id:'complete_25',     pass: completed>=25},
    {id:'complete_50',     pass: completed>=50},
    {id:'thread_5',        pass: threads.length>=5},
    {id:'reply_20',        pass: replies.length>=20},
    {id:'action_fan',      pass: (genreCounts['Action']||0)>=5},
    {id:'romance_fan',     pass: (genreCounts['Romance']||0)>=5},
    {id:'horror_fan',      pass: (genreCounts['Horror']||0)>=5},
    {id:'isekai_fan',      pass: (genreCounts['Isekai']||0)>=5},
    {id:'genre_master',    pass: uniqueGenresReviewed>=5},
  ];

  // Check OG member (first 10 users)
  const {count:userCount} = await sb.from('profiles').select('id',{count:'exact',head:true})
    .lt('created_at', currentProfile.created_at);
  checks.push({id:'og_member', pass: (userCount||0) < 10});

  const newlyEarned = [];
  for(const c of checks){
    if(c.pass && !earned.has(c.id)){
      const {error} = await sb.from('user_achievements').insert({user_id:currentUser.id, achievement_id:c.id});
      if(!error){
        earned.add(c.id);
        userAchievements.push({achievement_id:c.id, earned_at:new Date().toISOString()});
        newlyEarned.push(c.id);
      }
    }
  }
  if(newlyEarned.length) showUnlockToast(newlyEarned);
}

async function grantAdminAllAchievements(){
  if(!currentUser) return;
  const earned = new Set((userAchievements||[]).map(u=>u.achievement_id));
  const toGrant = allAchievements.filter(a=>!earned.has(a.id));
  for(const a of toGrant){
    await sb.from('user_achievements').insert({user_id:currentUser.id, achievement_id:a.id}).catch(()=>{});
  }
  await loadAchievements();
}

let unlockQueue = [];
let unlockShowing = false;
function showUnlockToast(ids){
  unlockQueue.push(...ids);
  if(!unlockShowing) nextUnlock();
}
function nextUnlock(){
  if(!unlockQueue.length){unlockShowing=false;return;}
  unlockShowing=true;
  const id = unlockQueue.shift();
  const ach = allAchievements.find(a=>a.id===id);
  if(!ach){nextUnlock();return;}
  const el = document.getElementById('ach-toast');
  document.getElementById('ach-toast-icon').textContent = ach.icon;
  document.getElementById('ach-toast-title').textContent = ach.title;
  document.getElementById('ach-toast-desc').textContent = ach.description;
  el.classList.add('show');
  setTimeout(()=>{
    el.classList.remove('show');
    setTimeout(nextUnlock, 400);
  }, 3200);
}

function filterAch(f, btn){
  achFilter = f;
  document.querySelectorAll('#ach-filter-row .tab-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderAchievements();
}

function renderAchievements(){
  const el = document.getElementById('achievements-list');
  if(!el) return;
  const earnedMap = {};
  (userAchievements||[]).forEach(u=>earnedMap[u.achievement_id]=u.earned_at);
  const equippedTitle = currentProfile?.equipped_title||null;

  let list = [...allAchievements];
  if(achFilter==='earned') list=list.filter(a=>earnedMap[a.id]);
  else if(achFilter==='rare') list=list.filter(a=>a.rarity==='rare');
  else if(achFilter==='epic') list=list.filter(a=>a.rarity==='epic');
  else if(achFilter==='legendary') list=list.filter(a=>a.rarity==='legendary');

  const earnedCount = allAchievements.filter(a=>earnedMap[a.id]).length;
  const progEl = document.getElementById('ach-progress-lbl');
  if(progEl) progEl.textContent = `${earnedCount} / ${allAchievements.length} earned`;

  // Sort: earned first, then by rarity
  const rarityOrder = {legendary:0,epic:1,rare:2,common:3};
  list.sort((a,b)=>{
    const ae=!!earnedMap[a.id], be=!!earnedMap[b.id];
    if(ae!==be) return ae?-1:1;
    return (rarityOrder[a.rarity]||3)-(rarityOrder[b.rarity]||3);
  });

  if(!list.length){el.innerHTML='<p style="color:var(--muted);font-size:0.82rem;text-align:center;padding:1rem 0">Nothing here yet</p>';
    const wrap=document.getElementById('ach-show-more-wrap');if(wrap)wrap.style.display='none';
    return;}

  const showAll = window._achShowAll || achFilter !== 'all';
  const displayList = showAll ? list : list.slice(0, 5);
  const hasMore = !showAll && list.length > 5;
  const wrap = document.getElementById('ach-show-more-wrap');
  const btn = document.getElementById('ach-show-more-btn');
  if(wrap) wrap.style.display = hasMore ? 'block' : 'none';
  if(btn && hasMore) btn.textContent = `Show All ${list.length} Titles ▼`;

  el.innerHTML = displayList.map(a=>{
    const isEarned = !!earnedMap[a.id];
    const isEquipped = equippedTitle===a.id;
    const earnedDate = isEarned ? new Date(earnedMap[a.id]).toLocaleDateString() : null;
    return `<div class="achievement-card ${isEarned?'earned':'locked'}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-info">
        <div class="ach-title">${escH(a.title)}</div>
        <div class="ach-req">${escH(isEarned?'✓ '+a.description:a.requirement)}</div>
        <div class="ach-rarity rarity-${a.rarity}">${a.rarity.toUpperCase()}</div>
      </div>
      ${isEarned?`<div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.4rem;flex-shrink:0;">
        <div class="ach-earned-date">${earnedDate}</div>
        <button class="equip-btn ${isEquipped?'equipped':''}" onclick="equipTitle('${escH(a.id)}','${escH(a.title)}')">${isEquipped?'✓ Equipped':'Equip'}</button>
      </div>`:''}
    </div>`;
  }).join('');
}

function toggleAllAch(){
  window._achShowAll = !window._achShowAll;
  const btn = document.getElementById('ach-show-more-btn');
  if(btn) btn.textContent = window._achShowAll ? 'Show Less ▲' : `Show All Titles ▼`;
  renderAchievements();
}

async function equipTitle(achId, title){
  const current = currentProfile?.equipped_title;
  const newVal = current===achId ? null : achId;
  await sb.from('profiles').update({equipped_title:newVal}).eq('id',currentUser.id);
  currentProfile.equipped_title = newVal;
  renderTitleBadge(newVal ? title : null);
  renderAchievements();
  toast(newVal ? `Equipped: ${title}` : 'Title unequipped');
}

/* ——— PROFILE ——— */
const BANNER_COLOURS = [
  '#e63946','#c1121f','#f4a261','#e9c46a','#2a9d8f',
  '#457b9d','#7c3aed','#db2777','#16a34a','#0f172a',
  '#1e293b','#374151','#6b21a8','#0369a1','#b45309',
];

const GENRES = ['Action','Adventure','Comedy','Drama','Fantasy','Horror','Isekai','Mecha','Mystery','Romance','Sci-Fi','Shounen','Slice of Life','Sports','Supernatural','Thriller'];
let pinSlotIndex = -1;

async function loadProfilePage(){
  if(!currentUser||!currentProfile)return;

  const uname = currentProfile.username||currentUser.email.split('@')[0];

  // Safe helpers for potentially null JSON columns
  const safeParse = (val, fallback=[]) => {
    if(!val) return fallback;
    if(Array.isArray(val)) return val;
    if(typeof val === 'object') return val;
    try{ return JSON.parse(val)||fallback; }catch{ return fallback; }
  };

  // Basic info
  document.getElementById('profile-username-display').textContent = uname;
  document.getElementById('profile-bio-input').value = currentProfile.bio||'';
  const bioDisp = document.getElementById('profile-bio-display');
  if(bioDisp) bioDisp.textContent = currentProfile.bio||'';
  const goalInput = document.getElementById('goal-input');
  if(goalInput) goalInput.value = currentProfile.watch_goal||'';
  renderPfpBig(currentProfile.avatar_url, uname);

  // Banner colour
  const banner = currentProfile.banner_colour||'#e63946';
  const bannerEl = document.getElementById('profile-banner');
  if(bannerEl) bannerEl.style.background = banner;

  // Equipped title
  try{ renderTitleBadge(currentProfile.equipped_title||null); }catch(e){}

  // Stats
  try{
    const watching = myListData.filter(e=>e.status==='watching').length;
    const completed = myListData.filter(e=>e.status==='completed').length;
    document.getElementById('ps-tracked').textContent = myListData.length;
    document.getElementById('ps-watching').textContent = watching;
    document.getElementById('ps-completed').textContent = completed;
    const {count} = await sb.from('reviews').select('id',{count:'exact',head:true}).eq('user_id',currentUser.id);
    document.getElementById('ps-reviews').textContent = count||0;
    updateGoalBar(completed, currentProfile.watch_goal);
  }catch(e){}

  // Pinned anime
  try{ renderPinnedGrid(); }catch(e){}

  // Achievements
  try{ renderAchievements(); }catch(e){}

  // Banner colour swatches
  try{
    const bg = document.getElementById('banner-colour-grid');
    if(bg){
      if(!bg.children.length){
        BANNER_COLOURS.forEach(c=>{
          const s = document.createElement('div');
          s.className = 'banner-swatch';
          s.style.background = c;
          s.title = c;
          s.onclick = ()=>{
            document.querySelectorAll('.banner-swatch').forEach(x=>x.classList.remove('bactive'));
            s.classList.add('bactive');
            saveBannerColour(c);
          };
          bg.appendChild(s);
        });
      }
      document.querySelectorAll('.banner-swatch').forEach(s=>s.classList.toggle('bactive', s.title===banner));
    }
  }catch(e){}

  // Genre grid
  try{
    const gg = document.getElementById('genre-grid');
    if(gg){
      const saved = safeParse(currentProfile.fav_genres, []);
      if(!gg.children.length){
        GENRES.forEach(g=>{
          const b = document.createElement('button');
          b.className = 'fave-genre-btn';
          b.textContent = g;
          b.onclick = ()=>toggleGenre(g,b);
          gg.appendChild(b);
        });
      }
      gg.querySelectorAll('.fave-genre-btn').forEach(b=>b.classList.toggle('gactive', saved.includes(b.textContent)));
    }
  }catch(e){}
}

function renderTitleBadge(titleOrId){
  const el = document.getElementById('profile-title-display');
  if(!el) return;
  if(!titleOrId){ el.innerHTML=''; return; }
  const ach = allAchievements.find(a=>a.id===titleOrId);
  const display = ach ? `${ach.icon} ${ach.title}` : titleOrId;
  el.innerHTML = `<span class="equipped-title-badge">${escH(display)}</span>`;
}

function updateGoalBar(completed, goal){
  const sec = document.getElementById('goal-section');
  const bar = document.getElementById('goal-bar');
  const lbl = document.getElementById('goal-label');
  if(!sec||!bar||!lbl) return;
  if(!goal){ sec.style.display='none'; return; }
  sec.style.display='block';
  const pct = Math.min(100, Math.round((completed/goal)*100));
  bar.style.width = pct+'%';
  lbl.textContent = `${completed} / ${goal} anime`;
  lbl.style.color = pct>=100 ? '#4ade80' : 'var(--text)';
}

function renderPinnedGrid(){
  const grid = document.getElementById('pinned-anime-grid');
  if(!grid) return;
  grid.innerHTML = '';
  const pinned = getPinned();
  for(let i=0;i<6;i++){
    const a = pinned[i];
    if(a){
      const d = document.createElement('div');
      d.className = 'pinned-card';
      d.innerHTML = `<img src="${escH(a.image)}" alt="${escH(a.title)}" onerror="this.style.background='var(--bg4)';this.removeAttribute('src')">
        <button class="pinned-remove" onclick="removePinned(${i},event)">✕</button>
        <div style="padding:0.4rem 0.4rem 0.45rem;font-size:0.68rem;font-weight:700;line-height:1.3;color:var(--text);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escH(a.title)}</div>`;
      grid.appendChild(d);
    } else {
      const d = document.createElement('div');
      d.className = 'pin-slot';
      d.innerHTML = `<div class="pin-slot-icon">＋</div><div class="pin-slot-label">Pin Anime</div>`;
      d.onclick = ()=>openPinSearch(i);
      grid.appendChild(d);
    }
  }
}

function openPinSearch(slotIdx){
  pinSlotIndex = slotIdx;
  const sec = document.getElementById('pin-search-section');
  sec.style.display = sec.style.display==='none' ? 'block' : 'none';
  document.getElementById('pin-search-results').innerHTML='';
  document.getElementById('pin-search-input').value='';
  if(sec.style.display!=='none') document.getElementById('pin-search-input').focus();
}

async function searchPinAnime(){
  const q = document.getElementById('pin-search-input').value.trim();
  if(!q) return;
  const res = document.getElementById('pin-search-results');
  res.innerHTML='<p style="color:var(--muted);font-size:0.8rem">Searching...</p>';
  try{
    const r = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=6&sfw=true`);
    const d = await r.json();
    if(!d.data?.length){ res.innerHTML='<p style="color:var(--muted);font-size:0.8rem">No results</p>'; return; }
    res.innerHTML='';
    d.data.forEach(a=>{
      const el = document.createElement('div');
      el.className='pin-result';
      el.innerHTML=`<img src="${escH(a.images?.jpg?.image_url||'')}" alt="" onerror="this.style.display='none'">
        <div><div style="font-size:0.82rem;font-weight:700">${escH(a.title)}</div>
        <div style="font-size:0.72rem;color:var(--muted)">${a.type||''} • ★${a.score||'N/A'}</div></div>`;
      el.onclick=()=>pinAnime(a.mal_id, a.title, a.images?.jpg?.image_url||'');
      res.appendChild(el);
    });
  }catch{ res.innerHTML='<p style="color:var(--muted);font-size:0.8rem">Search failed</p>'; }
}

function getPinned(){
  const raw = currentProfile.pinned_anime;
  if(!raw) return [];
  if(Array.isArray(raw)) return [...raw];
  try{ const p=JSON.parse(raw); return Array.isArray(p)?p:[]; }catch{ return []; }
}

async function pinAnime(mal_id, title, image){
  if(pinSlotIndex<0||pinSlotIndex>5) return;
  const pinned = getPinned();
  while(pinned.length<=pinSlotIndex) pinned.push(null);
  pinned[pinSlotIndex] = {mal_id,title,image};
  const clean = pinned.filter(Boolean);
  await sb.from('profiles').update({pinned_anime:clean}).eq('id',currentUser.id);
  currentProfile.pinned_anime = clean;
  document.getElementById('pin-search-section').style.display='none';
  renderPinnedGrid();
  toast('Pinned '+title+'!');
}

async function removePinned(idx, e){
  e.stopPropagation();
  const pinned = getPinned();
  pinned.splice(idx,1);
  const clean = pinned.filter(Boolean);
  await sb.from('profiles').update({pinned_anime:clean}).eq('id',currentUser.id);
  currentProfile.pinned_anime = clean;
  renderPinnedGrid();
}

async function saveBannerColour(colour){
  const bannerEl = document.getElementById('profile-banner');
  if(bannerEl) bannerEl.style.background = colour;
  await sb.from('profiles').update({banner_colour:colour}).eq('id',currentUser.id);
  currentProfile.banner_colour = colour;
  toast('Banner updated!');
}

async function toggleGenre(genre, btn){
  const raw = currentProfile.fav_genres;
  let saved = Array.isArray(raw) ? [...raw] : (()=>{ try{ const p=JSON.parse(raw||'[]'); return Array.isArray(p)?p:[]; }catch{ return []; } })();
  if(saved.includes(genre)){ saved=saved.filter(g=>g!==genre); btn.classList.remove('gactive'); }
  else{ if(saved.length>=3){toast('Max 3 genres');return;} saved.push(genre); btn.classList.add('gactive'); }
  await sb.from('profiles').update({fav_genres:JSON.stringify(saved)}).eq('id',currentUser.id);
  currentProfile.fav_genres = JSON.stringify(saved);
}

async function saveGoal(){
  const v = parseInt(document.getElementById('goal-input').value)||null;
  if(v&&(v<1||v>365)){toast('Goal must be 1-365');return;}
  await sb.from('profiles').update({watch_goal:v}).eq('id',currentUser.id);
  currentProfile.watch_goal = v;
  const completed = myListData.filter(e=>e.status==='completed').length;
  updateGoalBar(completed, v);
  toast(v ? 'Goal set: '+v+' anime this year!' : 'Goal cleared');
}

async function clearGoal(){
  document.getElementById('goal-input').value='';
  await sb.from('profiles').update({watch_goal:null}).eq('id',currentUser.id);
  currentProfile.watch_goal = null;
  updateGoalBar(0, null);
  toast('Goal cleared');
}

function renderPfpBig(url, uname){
  const wrap = document.getElementById('pfp-big-wrap');
  if(!wrap) return;
  const initial = escH(uname[0].toUpperCase());
  if(url){
    wrap.innerHTML=`<img src="${escH(url)}?t=${Date.now()}" alt="pfp" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" onerror="this.parentNode.innerHTML='<span id=pfp-initials>${initial}</span>'">`;
  } else {
    wrap.innerHTML=`<span id="pfp-initials">${initial}</span>`;
  }
}

function renderAvatarChip(url, uname){
  const el = document.getElementById('user-av');
  if(!el) return;
  if(url){
    el.innerHTML=`<img src="${escH(url)}?t=${Date.now()}" alt="av" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else {
    el.textContent = uname[0].toUpperCase();
  }
}

async function uploadPfp(input){
  const file = input.files[0];
  if(!file||!currentUser) return;
  if(file.size > 2*1024*1024){ toast('Max 2MB'); return; }
  const wrap = document.getElementById('pfp-big-wrap');
  wrap.classList.add('pfp-uploading');
  toast('Uploading...');
  const ext = file.name.split('.').pop().toLowerCase();
  const path = `${currentUser.id}/avatar.${ext}`;
  const {error} = await sb.storage.from('avatars').upload(path, file, {upsert:true, contentType:file.type});
  if(error){ toast('Upload failed: '+error.message); wrap.classList.remove('pfp-uploading'); return; }
  const {data} = sb.storage.from('avatars').getPublicUrl(path);
  await sb.from('profiles').update({avatar_url:data.publicUrl}).eq('id',currentUser.id);
  currentProfile.avatar_url = data.publicUrl;
  renderPfpBig(data.publicUrl, currentProfile.username);
  renderAvatarChip(data.publicUrl, currentProfile.username);
  wrap.classList.remove('pfp-uploading');
  toast('Profile picture updated!');
  input.value='';
}

async function saveBio(){
  const bio = document.getElementById('profile-bio-input').value.trim();
  await sb.from('profiles').update({bio}).eq('id',currentUser.id);
  currentProfile.bio = bio;
  const bioDisp = document.getElementById('profile-bio-display');
  if(bioDisp) bioDisp.textContent = bio;
  toast('Bio saved!');
}

/* ——— UTILS ——— */
function escH(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function timeAgo(ts){
  const s=Math.floor((Date.now()-new Date(ts))/1000);
  if(s<60)return 'just now';if(s<3600)return Math.floor(s/60)+'m ago';
  if(s<86400)return Math.floor(s/3600)+'h ago';return Math.floor(s/86400)+'d ago';
}
let toastT;
function toast(msg){
  const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),3000);
}
function goMyList(){
  const btn=document.querySelector('.nav-btn[onclick*="mylist"]');
  showPage('mylist',btn||document.createElement('button'));
}

/* ——— BOTTOM NAV SYNC ——— */
function syncBottomNav(activeBtn){
  document.querySelectorAll('.bn-btn').forEach(b=>b.classList.remove('active'));
  activeBtn.classList.add('active');
}
