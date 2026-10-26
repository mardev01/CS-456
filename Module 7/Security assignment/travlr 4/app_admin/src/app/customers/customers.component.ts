import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Customer } from '../services/admin-data.service';
@Component({selector:'app-customers',standalone:true,imports:[CommonModule,FormsModule],templateUrl:'./customers.component.html'})
export class CustomersComponent implements OnInit {
  customers:Customer[]=[];loading=true;error='';search='';pending:Customer|null=null;saving=false;
  constructor(private readonly data:AdminDataService) {}
  ngOnInit():void { this.data.customers().subscribe({next:rows=>{this.customers=rows;this.loading=false;},error:()=>{this.error='Customers could not be loaded.';this.loading=false;}}); }
  get filtered():Customer[] {const q=this.search.toLowerCase();return this.customers.filter(c=>(c.name+' '+c.email).toLowerCase().includes(q));}
  confirm():void {
    if(!this.pending||this.saving)return;this.saving=true;const customer=this.pending;
    this.data.setActive(customer._id,!customer.active).subscribe({next:updated=>{this.customers=this.customers.map(c=>c._id===updated._id?updated:c);this.pending=null;this.saving=false;},error:()=>{this.error='The customer account could not be updated.';this.saving=false;}});
  }
}
