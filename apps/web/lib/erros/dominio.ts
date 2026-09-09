/**
 * Erros que a aplicação sabe explicar. Cada um carrega o status HTTP que lhe
 * corresponde, de modo que as rotas não precisam repetir o par mensagem+status:
 * quem lança descreve o problema, e `comTratamentoDeErro` traduz para a resposta.
 */
export abstract class ErroDominio extends Error {
  abstract readonly status: number;

  constructor(mensagem: string) {
    super(mensagem);
    this.name = new.target.name;
  }
}

/** Corpo malformado, campo faltando ou fora do domínio aceito. */
export class DadosInvalidos extends ErroDominio {
  readonly status = 400;

  constructor(mensagem = "Dados inválidos.") {
    super(mensagem);
  }
}

/** O recurso endereçado na URL não existe. */
export class RegistroNaoEncontrado extends ErroDominio {
  readonly status = 404;

  constructor(mensagem = "Registro não encontrado.") {
    super(mensagem);
  }
}
