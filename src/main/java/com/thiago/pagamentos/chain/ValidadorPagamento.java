package com.thiago.pagamentos.chain;

import com.thiago.pagamentos.model.Pagamento;

public abstract class ValidadorPagamento {

    private ValidadorPagamento proximo;

    public ValidadorPagamento definirProximo(
            ValidadorPagamento proximo
    ) {
        this.proximo = proximo;

        return proximo;
    }

    public void validar(Pagamento pagamento) {

        validarAtual(pagamento);

        if (proximo != null) {
            proximo.validar(pagamento);
        }
    }

    protected abstract void validarAtual(Pagamento pagamento);
}