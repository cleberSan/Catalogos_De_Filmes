import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FilmesService } from 'src/app/core/filmes.service';
import { AlertaComponent } from 'src/app/shared/components/alerta/alerta.component';
import { ValidarCamposService } from 'src/app/shared/components/campos/validar-campos.service';
import { Alerta } from 'src/app/shared/models/alerta';
import { Filme } from 'src/app/shared/models/filme';

@Component({
  selector: 'dio-cadastro-filmes',
  templateUrl: './cadastro-filmes.component.html',
  styleUrls: ['./cadastro-filmes.component.scss']
})
export class CadastroFilmesComponent implements OnInit {

  cadastro: FormGroup;
  generos: Array<string>;
  minNotaImdb: number = 0;
  minLengthTitulo: number = 2;
  minLengthUrl: number = 10;
  maxLengthTitulo: number = 50;
  maxNotaImdb: number = 10;
  id: number;



  constructor(public validacao: ValidarCamposService,
              public dialog: MatDialog,          
              private fb: FormBuilder,
              private filmeService: FilmesService,
              private router: Router,
              private activatedRoute: ActivatedRoute
              ) { }

  get f(){
    return this.cadastro.controls;
  }

  ngOnInit() {
    this.id =this.activatedRoute.snapshot.params['id'];
    if(this.id){
      this.filmeService.visualizar(this.id).subscribe((filme: Filme) => this.criarFormulario(filme));
    }else{
      this.criarFormulario(this.criarFilmeEmBranco());
    }


    this.generos = ['Ação', 'Romance', 'Aventura', 'Terror', 'Drama', 'Ficção Cientifica', 'Comédia'];

  }
  
  submit(): void{
    this.cadastro.markAllAsTouched();
    if(this.cadastro.invalid){
      return;
    }
    const filme = this.cadastro.getRawValue() as Filme;
    if(this.id){
      filme.id = this.id;
      this.editar(filme);
    }else{
      this.salvar(filme);
    }
  }

  reiniciarForm(): void{
    this.cadastro.reset();
  }
  private criarFilmeEmBranco(): Filme{
    return{
      id: null,
      titulo: null,
      dataLancamento: null,
      urlFoto: null,
      descricao: null,
      notaImdb: null,
      urlImdb: null,
      genero: null
    } as Filme;
  }
  private criarFormulario(filme: Filme): void{
    this.cadastro = this.fb.group({
      titulo: [filme.titulo, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      urlFoto: [filme.urlFoto, Validators.minLength(this.minLengthUrl)],
      dataLancamento: [filme.dataLancamento, Validators.required],
      descricao: [filme.descricao],
      notaImdb: [filme.notaImdb,[Validators.required, Validators.min(this.minNotaImdb), Validators.max(this.maxNotaImdb)]],
      urlImdb: [filme.urlImdb,Validators.minLength(this.minLengthUrl)],
      genero: [filme.genero, Validators.required]

    });
  }
  private editar(filme: Filme): void{
    this.filmeService.editar(filme).subscribe(() => {
      const config = {
        data: {
          descricao: 'Seu registro foi atualizado',
          btnSucesso: 'Ir para listagem',
          possuirBtnFechar: true
        } as Alerta
      }

      const dialogRef = this.dialog.open(AlertaComponent, config);
      dialogRef.afterClosed().subscribe(() => this.router.navigateByUrl('filmes'));
      
    },
    () =>{
      const config = {
        data: {
          titulo: 'Erro ao editar Registro!',
          descricao: 'Não foi possível editar.',
          btnSucesso: 'Fechar',
          corBtnSucesso: 'warn'
        } as Alerta
      }
      this.dialog.open(AlertaComponent, config);
    });
  }
  private salvar(filme: Filme): void{
    this.filmeService.salvar(filme).subscribe(() => {
      const config = {
        data: {
          btnSucesso: 'Ir para listagem',
          btnCancelar: 'Cadastrar um novo Filme',
          possuirBtnFechar: true
        } as Alerta
      }

      const dialogRef = this.dialog.open(AlertaComponent, config);
      dialogRef.afterClosed().subscribe((opcao: boolean) => {
        if(opcao){
          this.router.navigateByUrl('filmes');
        } else{
          this.reiniciarForm();
        }
      });
    },
    () =>{
      const config = {
        data: {
          titulo: 'Erro ao Salvar Registro!',
          descricao: 'Não foi possível salvar.',
          btnSucesso: 'Fechar',
          corBtnSucesso: 'warn'
        } as Alerta
      }
      this.dialog.open(AlertaComponent, config);
    });
  }
}
