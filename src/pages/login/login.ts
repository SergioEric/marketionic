import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { AuthService } from '../../services/AuthService';
import { AngularFireAuth } from 'angularfire2/auth';

import { DashPage } from '../dash/dash';
import { HomePage } from '../home/home';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  email:string;
  password:string;
  user:any;

  constructor(
  	public navCtrl: NavController,
  	public navParams: NavParams,
  	private authService:AuthService,
  	private auth:AngularFireAuth
  	) {
    this.auth.auth.onAuthStateChanged(user => {
      if (user) {
        this.navCtrl.push(HomePage);
        this.user = user;
      } //else {
      //   this.rootPage = DashPage;
      //   this.unsubscribe();
      // }
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  handleLogin(){
    if(this.email.trim() == "" || this.password.trim()==""){ return;}
    // this.auth.auth.signInWithEmailAndPassword("","").then(user=>{
    // });
    this.authService.emailLogin(this.email,this.password);
    // alert(`${this.email}- ${this.password}`)
  }
  handleRegister(){
    if(this.email.trim() == "" || this.password.trim()==""){ return;}
    this.authService.emailSignUp(this.email,this.password);
  }

}
