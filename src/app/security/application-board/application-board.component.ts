import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-board',
  standalone: true,
  imports: [],
  templateUrl: './application-board.component.html',
  styleUrls: ['./application-board.component.css']
})
export class ApplicationBoardComponent {
  public nameApplication: string = 'SISTEMA INTEGRADO DE SEGURIDAD';
  public nameUser: string = 'U0001 - JORGE GUEVARA';
  public version: string = "1.0";

  constructor(
    private router: Router
  ) {
  }
  public exit() {
    this.router.navigate(['/login']);
  }

  public loadApplication (applicationId: number) {

    this.router.navigate(['/maintenance']);
  }
}
