/* Mile One cloud: family accounts, learner join codes and saved progress (Supabase).
   Every function resolves to {data, error}. error is a plain sentence or null. Nothing here rejects. */
(function(){
'use strict';
var MO = window.MO, cfg = MO.CONFIG || {}, client = null;
var OFFLINE = 'Could not reach the server. Check your connection and try again.';

function nice(err){
  var m = (err && (err.message || err.error_description || err.msg)) || '', c = (err && err.code) || '';
  if (/invalid login credentials/i.test(m)) return 'That email and password do not match an account.';
  if (/email not confirmed/i.test(m)) return 'Confirm your email first. Open the message we sent you and tap the link.';
  if (/already registered|already exists/i.test(m)) return 'That email already has an account. Sign in instead.';
  if (c === 'email_address_not_authorized' || /not authorized/i.test(m)) return 'We could not send a confirmation email to that address yet. Email sending is still being set up.';
  if (c === 'over_email_send_rate_limit' || /rate limit/i.test(m)) return 'Too many emails were sent in the last hour. Wait a while and try again.';
  if (/password/i.test(m) && /(short|least|weak|characters)/i.test(m)) return 'Use a password with at least 8 characters.';
  if (/different from the old/i.test(m)) return 'Pick a password you have not used on this account before.';
  if (/valid email|invalid format|invalid email/i.test(m)) return 'That does not look like an email address.';
  if (/up to 8 learners/i.test(m)) return 'A family can have up to 8 learners.';
  if (/learner not found/i.test(m)) return 'That learner is no longer on this account. Reload the page.';
  if (/not allowed/i.test(m)) return 'That page is for the site owner.';
  if (/account not found/i.test(m)) return 'That account no longer exists.';
  if (/failed to fetch|network|load failed/i.test(m)) return OFFLINE;
  return m || 'Something went wrong. Try again.';
}
function wrap(promise, pick){
  return Promise.resolve(promise).then(function(r){
    if (r && r.error) return {data:null, error:nice(r.error)};
    return {data: pick ? pick(r.data, r) : (r ? r.data : null), error:null};
  }).catch(function(e){ return {data:null, error:nice(e) || OFFLINE}; });
}
function here(){ return location.origin + location.pathname; }
/* these functions answer {error:'invalid'|'rate'|'unlinked'} in place of failing */
var RPC_ERR = {
  invalid: 'That code did not work. Check it with a parent. Codes last 48 hours and work once.',
  rate: 'Too many tries. Wait 15 minutes, then ask a parent for a new code.',
  unlinked: 'unlinked'
};
function rpc(name, args){
  return wrap(client.rpc(name, args)).then(function(r){
    if (!r.error && r.data && r.data.error) return {data:null, error:RPC_ERR[r.data.error] || 'Something went wrong. Try again.'};
    return r;
  });
}
function need(){ return client ? null : Promise.resolve({data:null, error:OFFLINE}); }

MO.cloud = {
  enabled: function(){ return !!client; },
  /* resolves to the current session, or null */
  init: function(){
    if (!cfg.supabaseUrl || !window.supabase || !window.supabase.createClient) return Promise.resolve(null);
    try {
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {auth:{persistSession:true, autoRefreshToken:true, detectSessionInUrl:true}});
    } catch (e) { client = null; return Promise.resolve(null); }
    return client.auth.getSession().then(function(r){ return r && r.data ? r.data.session : null; }).catch(function(){ return null; });
  },
  onAuth: function(cb){ if (client) client.auth.onAuthStateChange(function(ev, session){ cb(ev, session); }); },

  signUp: function(email, password){
    return need() || wrap(client.auth.signUp({email:email, password:password, options:{emailRedirectTo:here()}}), function(d){
      /* an address that already has an account comes back with no identities */
      if (d && d.user && d.user.identities && d.user.identities.length === 0) return {exists:true};
      return {session:d ? d.session : null, needsConfirm: !(d && d.session)};
    });
  },
  signIn: function(email, password){ return need() || wrap(client.auth.signInWithPassword({email:email, password:password})); },
  signOut: function(){ return need() || wrap(client.auth.signOut()); },
  resetRequest: function(email){ return need() || wrap(client.auth.resetPasswordForEmail(email, {redirectTo:here()})); },
  setPassword: function(password){ return need() || wrap(client.auth.updateUser({password:password})); },

  listLearners: function(){
    return need() || wrap(client.from('learners').select('id,name,created_at,progress(data,updated_at),learner_devices(id)').order('created_at', {ascending:true}), function(rows){
      return (rows || []).map(function(r){
        var p = Array.isArray(r.progress) ? r.progress[0] : r.progress;
        return {id:r.id, name:r.name, data:p ? p.data : null, devices:Array.isArray(r.learner_devices) ? r.learner_devices.length : 0};
      });
    });
  },
  addLearner: function(name){
    return need() || wrap(client.from('learners').insert({name:name}).select('id,name').single(), function(r){ return {id:r.id, name:r.name, data:null, devices:0}; });
  },
  renameLearner: function(id, name){ return need() || wrap(client.from('learners').update({name:name}).eq('id', id)); },
  removeLearner: function(id){ return need() || wrap(client.from('learners').delete().eq('id', id)); },
  pull: function(id){
    return need() || wrap(client.from('progress').select('data').eq('learner_id', id).maybeSingle(), function(r){ return r ? r.data : null; });
  },
  put: function(id, data){
    return need() || wrap(client.from('progress').upsert({learner_id:id, data:data, updated_at:new Date().toISOString()}));
  },

  /* ---- join codes: a learner's own phone, linked to their profile without a login ---- */
  /* parent: a fresh one-time code for this learner -> {code, expires_at} */
  createCode: function(id){ return need() || wrap(client.rpc('create_join_code', {p_learner:id})); },
  /* parent: cut off every device linked to this learner */
  unlinkDevices: function(id){ return need() || wrap(client.from('learner_devices').delete().eq('learner_id', id)); },
  /* learner: trade a code for a link -> {token, learner_id, name, data} */
  redeemCode: function(code){ return need() || rpc('redeem_join_code', {p_code:code}); },
  /* linked device: read and save progress. error 'unlinked' means a parent removed the link. */
  devicePull: function(token){ return need() || rpc('device_pull', {p_token:token}); },
  devicePut: function(token, data){ return need() || rpc('device_put', {p_token:token, p_data:data}); },
  deviceUnlink: function(token){ return need() || rpc('device_unlink', {p_token:token}); },

  /* ---- site owner: read-only view of every family. The database checks who is asking. ---- */
  isAdmin: function(){ return need() || wrap(client.rpc('is_admin'), function(v){ return v === true; }); },
  adminAccounts: function(){ return need() || wrap(client.rpc('admin_list_accounts')); },
  adminAccount: function(id){ return need() || wrap(client.rpc('admin_account', {p_user:id})); }
};
})();
