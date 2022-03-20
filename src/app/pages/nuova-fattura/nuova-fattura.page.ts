import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { FattureService } from '../fatture/fatture.service';
import { Params, Router, ActivatedRoute } from '@angular/router';
import { Fattura } from 'src/app/models/fattura';
import { subscriptionLogsToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './nuova-fattura.page.html',
  styleUrls: ['./nuova-fattura.page.scss'],
})
export class NuovaFatturaPage implements OnInit {
  isLoading = false;
  errorMessage = undefined;
  authSrv: any;
  sub!: Subscription;
  id: number | undefined;
  numeroFattura: number | undefined;
  constructor(
    private fatSrv: FattureService,
    private router: ActivatedRoute,
    private routerNavigate: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.router.params.subscribe((params: Params) => {
      this.id = +parseInt(params['id']);
      this.fatSrv;
      console.log(params['id']);
    });

    this.fatSrv.recuperaUltimaFattura(this.id!).subscribe((res) => {
      let ultimoNumero = 0;
      for (let i of res.content) {
        if (i.numero > ultimoNumero) {
          ultimoNumero = i.numero;
        }
      }
      console.log(ultimoNumero);
      this.numeroFattura = ultimoNumero + 1;
    });
  }

  async onsubmit(form: NgForm) {
    let statoId: number;
    if (form.value.stato == 'PAGATA') {
      statoId = 1;
    } else if (form.value.stato == 'NON PAGATA') {
      statoId = 2;
    }
    const nuovaFattura = JSON.parse(`
    {
    "data":"${form.value.date}",
    "numero":${form.value.numero},
    "anno":${form.value.anno},
    "importo":${form.value.importo},
    "stato":{
      "id": ${statoId!},
      "nome": "${form.value.stato}"
  }
  ,"cliente":{
        "id":${form.value.clienteId}
  }}
  `);

    this.isLoading = true;
    try {
      await this.fatSrv.nuovaFattura(nuovaFattura);
      console.log(form.value);
      form.reset();
      this.isLoading = false;
      this.errorMessage = undefined;
      alert('Nuova Fattura inserita correttamente!');
      this.routerNavigate.navigate(['/fatture']);
    } catch (error: any) {
      this.isLoading = false;
      this.errorMessage = error;
      console.error(error);
    }
  }
}
