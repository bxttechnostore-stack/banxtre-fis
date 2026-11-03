/* Firebase veri katmanı. Uygulama yalnızca window.Veri üzerinden konuşur. */
(function(){
  firebase.initializeApp(window.FIREBASE_YAPILANDIRMA);
  const auth=firebase.auth(), db=firebase.firestore();
  const POSTA={sahip:'sahip@banxtre.fis',eleman:'eleman@banxtre.fis',yazici:'yazici@banxtre.fis'};
  const fisler=db.collection('fisler');
  window.Veri={
    oturum(cb){auth.onAuthStateChanged(u=>cb(u?u.email.split('@')[0]:null));},
    giris(rol,sifre){return auth.signInWithEmailAndPassword(POSTA[rol],sifre);},
    cikis(){return auth.signOut();},
    fisDinle(cb,hata){
      return fisler.orderBy('olusturuldu','desc').limit(500).onSnapshot({includeMetadataChanges:true},
        s=>cb(s.docs.map(d=>({id:d.id,...d.data()})),{onbellek:s.metadata.fromCache}),hata);
    },
    async fisEkle(o){const r=await fisler.add(o);return r.id;},
    fisGuncelle(id,o){return fisler.doc(id).update(o);},
    fisSil(id){return fisler.doc(id).delete();},
    baskiAl(id){ // Aynı fiş iki kez basılmasın
      const r=fisler.doc(id);
      return db.runTransaction(async t=>{
        const d=await t.get(r);
        if(!d.exists||d.data().durum!=='yazdir')return false;
        t.update(r,{durum:'basildi',basildi:new Date().toISOString()});return true;
      });
    },
    async ayarOku(ad){const d=await db.collection('ayar').doc(ad).get();return d.exists?d.data():null;},
    ayarYaz(ad,o){return db.collection('ayar').doc(ad).set(o,{merge:true});},
    ayarDinle(ad,cb){return db.collection('ayar').doc(ad).onSnapshot(d=>cb(d.exists?d.data():null),()=>{});}
  };
})();
