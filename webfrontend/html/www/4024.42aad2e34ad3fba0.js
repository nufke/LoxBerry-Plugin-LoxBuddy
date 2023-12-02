"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[4024],{4024:(T,m,l)=>{l.r(m),l.d(m,{SettingsPageModule:()=>Z});var u=l(6814),p=l(6223),i=l(7027),h=l(9515),c=l(6089),t=l(5879),f=l(9140);function d(e,a){1&e&&t._UZ(0,"ion-back-button",9)}function _(e,a){1&e&&t._UZ(0,"ion-menu-button")}function P(e,a){if(1&e&&(t.TgZ(0,"ion-select-option",10),t._uU(1),t.ALo(2,"lowercase"),t.ALo(3,"translate"),t.qZA()),2&e){const r=a.$implicit;t.Q6J("value",r),t.xp6(1),t.AsE("",r," ",t.lcZ(2,3,t.lcZ(3,5,"Minutes")),"")}}const S=[{path:"",component:(()=>{var e;class a{constructor(s,n,g){this.router=s,this.ionRouterOutlet=n,this.storageService=g,this.timeoutList=[5,10,15,30,60],this.hidePassword="password",this.eye="eye",this.storageSubscription=this.storageService.settings$.subscribe(o=>{o&&o.app&&(this.appSettings=o.app,this.lockPage=o.app.lockPage||void 0===o.app.lockPage,this.timeout=o.app.timeout?o.app.timeout:3e5,this.pin=o.app.pin?o.app.pin:"0000",this.timeoutListItem=this.timeoutList.find(N=>N==this.timeout/6e4),this.localNotifications=o.app.localNotifications,this.remoteNotifications=o.app.remoteNotifications)})}ngOnInit(){this.canGoBack=this.ionRouterOutlet.canGoBack(),this.currentUrl=this.router.url,this.routerEventsSubscription=this.router.events.subscribe(s=>{s instanceof c.m2&&(this.previousUrl=this.currentUrl,this.currentUrl=s.url)})}ngOnDestroy(){this.routerEventsSubscription.unsubscribe(),this.storageSubscription.unsubscribe()}setTimeout(s){this.timeout=6e4*Number(s.detail.value),this.saveSettings()}setPIN(s){this.pin=s.detail.value,this.saveSettings()}toggleHidePassword(){this.hidePassword="text"===this.hidePassword?"password":"text",this.eye="eye"===this.eye?"eye-off":"eye"}saveSettings(){this.storageService.saveSettings({app:{...this.appSettings,lockPage:this.lockPage,timeout:this.timeout,pin:this.pin,localNotifications:this.localNotifications,remoteNotifications:this.remoteNotifications}})}}return(e=a).\u0275fac=function(s){return new(s||e)(t.Y36(c.F0),t.Y36(i.jP),t.Y36(f.V1))},e.\u0275cmp=t.Xpm({type:e,selectors:[["app-settings"]],decls:28,vars:16,consts:[["slot","start"],["defaultHref","previousUrl",4,"ngIf"],[4,"ngIf"],["lines","full",1,"settings-list"],["interface","popover",3,"value","ionChange"],[3,"value",4,"ngFor","ngForOf"],["translate","",3,"ngModel","ngModelChange","ionChange"],["label","PIN","maxlength","4",3,"value","type","ionInput"],["item-right","",3,"name","click"],["defaultHref","previousUrl"],[3,"value"]],template:function(s,n){1&s&&(t.TgZ(0,"ion-header")(1,"ion-toolbar")(2,"ion-buttons",0),t.YNc(3,d,1,0,"ion-back-button",1),t.YNc(4,_,1,0,"ion-menu-button",2),t.qZA(),t.TgZ(5,"ion-title"),t._uU(6),t.ALo(7,"translate"),t.qZA()()(),t.TgZ(8,"ion-content")(9,"ion-list",3)(10,"ion-item")(11,"ion-label"),t._uU(12),t.ALo(13,"translate"),t.qZA(),t.TgZ(14,"ion-select",4),t.NdJ("ionChange",function(o){return n.setTimeout(o)}),t.YNc(15,P,4,7,"ion-select-option",5),t.qZA()(),t.TgZ(16,"ion-item")(17,"ion-toggle",6),t.NdJ("ngModelChange",function(o){return n.lockPage=o})("ionChange",function(){return n.saveSettings()}),t._uU(18,"Screensaver lock"),t.qZA()(),t.TgZ(19,"ion-item")(20,"ion-input",7),t.NdJ("ionInput",function(o){return n.setPIN(o)}),t.qZA(),t.TgZ(21,"ion-icon",8),t.NdJ("click",function(){return n.toggleHidePassword()}),t.qZA()(),t.TgZ(22,"ion-item")(23,"ion-toggle",6),t.NdJ("ngModelChange",function(o){return n.localNotifications=o})("ionChange",function(){return n.saveSettings()}),t._uU(24,"Local notifications"),t.qZA()(),t.TgZ(25,"ion-item")(26,"ion-toggle",6),t.NdJ("ngModelChange",function(o){return n.remoteNotifications=o})("ionChange",function(){return n.saveSettings()}),t._uU(27,"Remote notifications"),t.qZA()()()()),2&s&&(t.xp6(3),t.Q6J("ngIf",n.canGoBack),t.xp6(1),t.Q6J("ngIf",!n.canGoBack),t.xp6(2),t.Oqu(t.lcZ(7,12,"Settings")),t.xp6(6),t.Oqu(t.lcZ(13,14,"Screensaver delay")),t.xp6(2),t.Q6J("value",n.timeoutListItem),t.xp6(1),t.Q6J("ngForOf",n.timeoutList),t.xp6(2),t.Q6J("ngModel",n.lockPage),t.xp6(3),t.Q6J("value",n.pin)("type",n.hidePassword),t.xp6(1),t.Q6J("name",n.eye),t.xp6(2),t.Q6J("ngModel",n.localNotifications),t.xp6(3),t.Q6J("ngModel",n.remoteNotifications))},dependencies:[u.sg,u.O5,p.JJ,p.On,i.oU,i.Sm,i.W2,i.Gu,i.gu,i.pK,i.Ie,i.Q$,i.q_,i.fG,i.t9,i.n0,i.wd,i.ho,i.sr,i.w,i.QI,i.j9,i.cs,h.Pi,u.i8,h.X$],styles:[".settings-list[_ngcontent-%COMP%]{padding-bottom:0}.settings-list[_ngcontent-%COMP%]   ion-item[_ngcontent-%COMP%]{padding-right:10px;font-size:18px}"]}),a})()}];let v=(()=>{var e;class a{}return(e=a).\u0275fac=function(s){return new(s||e)},e.\u0275mod=t.oAB({type:e}),e.\u0275inj=t.cJS({imports:[c.Bz.forChild(S),c.Bz]}),a})(),Z=(()=>{var e;class a{}return(e=a).\u0275fac=function(s){return new(s||e)},e.\u0275mod=t.oAB({type:e}),e.\u0275inj=t.cJS({imports:[u.ez,p.u5,i.Pc,v,h.aw]}),a})()}}]);