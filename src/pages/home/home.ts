import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';


// import { FcmProvider } from '../../providers/fcm/fcm';
import { ToastController } from 'ionic-angular';
import { Subject } from 'rxjs/Subject';
import { tap } from 'rxjs/operators'


import { AngularFireAuth } from 'angularfire2/auth';
import { 
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { AuthService } from '../../services/AuthService';

// import { DashPage } from '../dash/dash';

interface Items {
  product_name: number,
  product_cost: string,
  product_description: number,
  product_image: number,
}
interface ItemId extends Items{ id:string }

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  displayName:string;

  user:any;

  itemsCollection: AngularFirestoreCollection<Items>; //Firestore collection
  items: Observable<Items[]>; // read collection

  private shirtCollection: AngularFirestoreCollection<Items>;
  shirts: Observable<ItemId[]>;

  carList:string[]=[];

  constructor(
    public navCtrl: NavController,
    // private fcm:FcmProvider,
    private auth:AngularFireAuth,
    private authService:AuthService,
    public toastCtrl:ToastController,
    public afs:AngularFirestore
  ) {

    // this.auth.auth.onAuthStateChanged(user => {
    //   if (user) {
        // this.navCtrl.push(DashPage);
        // this.user = user;
      // } else {
      //   this.rootPage = DashPage;
      //   this.unsubscribe();
      // }
    // });
    // afs.collection('products').snapshotChanges()
    /*
    fcm.getToken()

    // Listen to incoming messages
    fcm.listenToNotifications().pipe(
      tap(msg => {
        // show a toast
        const toast = toastCtrl.create({
          message: msg.body,
          duration: 3000
        });
        toast.present();
      })
    )
    .subscribe()*/
    
    if(this.authService.authState){
      
      this.displayName = this.authService.currentUserDisplayName();
    }else{
      this.displayName = "Inicia sesion"
    }

  }

  //  getProducts(){
  //     db.collection('products').get().then((querySnapshot)=>{
  //     querySnapshot.forEach((doc)=>{
  //       if(doc && doc.exists){
  //         const data = doc.data()
  //         output_products.innerHTML += `name: ${data.product_name} \n 
  //                     ${data.product_cost}
  //         `
  //         console.log(data)
  //       }else{
  //         console.log('no existe la collection products')
  //       }  
  //     })
  // })
  // }
  ionViewWillEnter() {
    // this.itemsCollection = this.afs.collection('products'); //ref()
    // this.items = this.itemsCollection.valueChanges()

   this.shirtCollection = this.afs.collection<Items>('products');
    this.shirts = this.shirtCollection.snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Items;
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    });
  }
  addToFavorites(id:string){
    console.log(`agregar a favoritos con id: ${id}`);
    this.viewCarList();
  }
  addToCar(id:string){
    let exist= false;
    if(this.carList.length == 0) {this.carList.push(id); return;}
    this.carList.map(v=>{
      debugger;
        if(v==id){
          exist = true;
          return;
        }
    })
    if(!exist){
      this.carList.push(id);
      console.log(`agregar al carrito ${id}`);
    }
  }
  viewCarList(){
    let ids='';
    if(this.carList.length == 0) return;
    this.carList.map(v=>{
      // debugger;
      ids+=`${v} \n`;
    })
    alert(ids)
  }
}
