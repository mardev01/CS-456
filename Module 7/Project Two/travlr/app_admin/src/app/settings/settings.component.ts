import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminDataService } from '../services/admin-data.service';
import { AuthenticationService } from '../services/authentication.service';
@Component({selector:'app-settings',standalone:true,imports:[CommonModule,ReactiveFormsModule],templateUrl:'./settings.component.html'})
export class SettingsComponent implements OnInit {
  error='';saved=false;loading=true;saving=false;email='';
  readonly form=this.fb.nonNullable.group({name:['',[Validators.required,Validators.maxLength(100)]]});
  constructor(private readonly fb:FormBuilder,private readonly data:AdminDataService,private readonly auth:AuthenticationService) {}
  ngOnInit():void {this.data.profile().subscribe({next:profile=>{this.form.patchValue({name:profile.name});this.email=profile.email;this.loading=false;},error:()=>{this.error='Account settings could not be loaded.';this.loading=false;}});}
  save():void {
    if(this.form.invalid||this.saving||this.loading)return;this.saving=true;this.error='';
    this.data.updateProfile(this.form.getRawValue().name).subscribe({next:profile=>{this.auth.saveToken(profile.token);this.saved=true;this.saving=false;},error:()=>{this.error='Your name could not be updated.';this.saving=false;}});
  }
}
