"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[6622],{6622:(B,d,r)=>{r.r(d),r.d(d,{NotificationsPageModule:()=>k});var u=r(6814),_=r(6223),a=r(7027),m=r(9515),f=r(6089),N=r(7398),h=r(6676),t=r(5879),v=r(711);function P(n,o){1&n&&t._UZ(0,"ion-back-button",5)}function b(n,o){1&n&&t._UZ(0,"ion-back-button",6)}function y(n,o){if(1&n&&(t.ynx(0),t.TgZ(1,"ion-item",10)(2,"ion-text",11),t._uU(3),t.qZA(),t.TgZ(4,"ion-text",12),t._uU(5),t.qZA()(),t.BQk()),2&n){const e=o.$implicit,i=t.oxw(4);t.xp6(3),t.Oqu(i.getTime(e.ts)),t.xp6(2),t.Oqu(e.title)}}function O(n,o){if(1&n&&(t.ynx(0),t.TgZ(1,"ion-list",8)(2,"ion-item",9)(3,"ion-text"),t._uU(4),t.qZA()(),t.YNc(5,y,6,2,"ng-container",7),t.qZA(),t.BQk()),2&n){const e=o.$implicit,i=t.oxw(2).ngIf;t.xp6(4),t.Oqu(e),t.xp6(1),t.Q6J("ngForOf",i.items[e])}}function T(n,o){if(1&n&&(t.ynx(0),t.YNc(1,O,6,2,"ng-container",7),t.BQk()),2&n){const e=t.oxw().ngIf,i=t.oxw();t.xp6(1),t.Q6J("ngForOf",i.getDates(e.items))}}function Z(n,o){1&n&&(t.ynx(0),t.TgZ(1,"ion-grid",13)(2,"ion-row",14)(3,"ion-text",3),t._uU(4,"No notifications"),t.qZA()()(),t.BQk())}function M(n,o){if(1&n&&(t.ynx(0),t.YNc(1,T,2,1,"ng-container",4),t.YNc(2,Z,5,0,"ng-container",4),t.BQk()),2&n){const e=o.ngIf,i=t.oxw();t.xp6(1),t.Q6J("ngIf",i.getSize(e.items)),t.xp6(1),t.Q6J("ngIf",!i.getSize(e.items))}}const U=[{path:"",component:(()=>{var n;class o{constructor(i,c,l,x){this.ionRouterOutlet=i,this.router=c,this.dataService=l,this.translate=x}ngOnInit(){this.canGoBack=this.ionRouterOutlet.canGoBack(),this.currentUrl=this.router.url,this.routerEventsSubscription=this.router.events.subscribe(i=>{i instanceof f.m2&&(this.previousUrl=this.currentUrl,this.currentUrl=i.url)}),this.vm$=this.dataService.notifications$.pipe((0,N.U)(i=>this.updateVM(i)))}updateVM(i){let c=[],l={};i.forEach(s=>{let g=this.getDate(s.ts);-1==c.findIndex(p=>p===g)&&c.push(g)});for(let s=c.length-1;s>-1;s--)l[c[s]]=i.filter(g=>this.getDate(g.ts)===c[s]).sort((g,p)=>Number(p.ts)-Number(g.ts));return{items:l}}getDate(i){return h(1e3*Number(i)).locale(this.translate.currentLang).format("LL")}getTime(i){return h(1e3*Number(i)).locale(this.translate.currentLang).format("LT")}getDates(i){return i?Object.keys(i):[]}getSize(i){return i?Object.keys(i).length:0}ngOnDestroy(){this.routerEventsSubscription.unsubscribe()}}return(n=o).\u0275fac=function(i){return new(i||n)(t.Y36(a.jP),t.Y36(f.F0),t.Y36(v.D),t.Y36(m.sK))},n.\u0275cmp=t.Xpm({type:n,selectors:[["app-notifications"]],decls:10,vars:5,consts:[["slot","start"],["defaultHref","previousUrl",4,"ngIf"],["defaultHref","/",4,"ngIf"],["translate",""],[4,"ngIf"],["defaultHref","previousUrl"],["defaultHref","/"],[4,"ngFor","ngForOf"],["lines","full",1,"history-list"],[1,"item-header"],[1,"item-body"],[1,"text-time"],[1,"text-descr"],[1,"grid-c"],[1,"row-c"]],template:function(i,c){1&i&&(t.TgZ(0,"ion-header")(1,"ion-toolbar")(2,"ion-buttons",0),t.YNc(3,P,1,0,"ion-back-button",1),t.YNc(4,b,1,0,"ion-back-button",2),t.qZA(),t.TgZ(5,"ion-title",3),t._uU(6,"Notifications"),t.qZA()()(),t.TgZ(7,"ion-content"),t.YNc(8,M,3,2,"ng-container",4),t.ALo(9,"async"),t.qZA()),2&i&&(t.xp6(3),t.Q6J("ngIf",c.canGoBack),t.xp6(1),t.Q6J("ngIf",!c.canGoBack),t.xp6(4),t.Q6J("ngIf",t.lcZ(9,3,c.vm$)))},dependencies:[u.sg,u.O5,a.oU,a.Sm,a.W2,a.jY,a.Gu,a.Ie,a.q_,a.Nd,a.yW,a.wd,a.sr,a.cs,m.Pi,u.Ov],styles:[".history-list[_ngcontent-%COMP%]{padding-top:0;padding-bottom:0}.item-header[_ngcontent-%COMP%]{font-size:18px}.item-body[_ngcontent-%COMP%]{font-size:18px;--background: var(--ion-background-color, #f3f3f3)}.text-time[_ngcontent-%COMP%]{color:var(--ion-color-secondary, #9d9e9e);padding-right:10px}.text-descr[_ngcontent-%COMP%]{position:absolute;left:55px}.grid-c[_ngcontent-%COMP%]{height:100%!important}.row-c[_ngcontent-%COMP%]{height:100%!important;align-items:center!important;justify-content:center!important}"]}),o})()}];let I=(()=>{var n;class o{}return(n=o).\u0275fac=function(i){return new(i||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[f.Bz.forChild(U),f.Bz]}),o})(),k=(()=>{var n;class o{}return(n=o).\u0275fac=function(i){return new(i||n)},n.\u0275mod=t.oAB({type:n}),n.\u0275inj=t.cJS({imports:[u.ez,_.u5,a.Pc,I,m.aw]}),o})()}}]);