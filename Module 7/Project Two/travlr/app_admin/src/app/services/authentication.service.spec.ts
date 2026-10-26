import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let http: HttpTestingController;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthenticationService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); sessionStorage.clear(); });
  it('stores a successful sign-in token and removes it on sign out', () => {
    service.login('admin@test.invalid', 'password').subscribe();
    const request = http.expectOne('http://localhost:3000/api/login');
    expect(request.request.method).toBe('POST');
    const token = 'header.' + btoa(JSON.stringify({name:'Test',email:'admin@test.invalid',exp:Math.floor(Date.now()/1000)+60})) + '.signature';
    request.flush({token});
    expect(service.isLoggedIn()).toBeTrue(); service.logout(); expect(service.getToken()).toBeNull();
  });
  it('clears an expired or malformed token', () => {
    sessionStorage.setItem('travlr-token', 'header.' + btoa(JSON.stringify({exp:1})) + '.signature');
    expect(service.isLoggedIn()).toBeFalse(); expect(service.getToken()).toBeNull();
    sessionStorage.setItem('travlr-token','broken'); expect(service.isLoggedIn()).toBeFalse();
  });
  it('does not create a session when credentials are rejected', () => {
    service.login('admin@test.invalid','wrong').subscribe({error:()=>{}});
    http.expectOne('http://localhost:3000/api/login').flush({message:'Incorrect'},{status:401,statusText:'Unauthorized'});
    expect(service.isLoggedIn()).toBeFalse();
  });
});
