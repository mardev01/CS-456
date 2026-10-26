import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
describe('Administrator route guard', () => {
  beforeEach(() => { sessionStorage.clear(); TestBed.configureTestingModule({providers:[provideHttpClient(),provideRouter([])]}); });
  afterEach(() => sessionStorage.clear());
  it('redirects a signed-out visitor to login with the requested edit page', () => {
    const result = TestBed.runInInjectionContext(() => authGuard({} as any,{url:'/edit-trip/TEST'} as any)) as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(result)).toBe('/login?returnUrl=%2Fedit-trip%2FTEST');
  });
});
