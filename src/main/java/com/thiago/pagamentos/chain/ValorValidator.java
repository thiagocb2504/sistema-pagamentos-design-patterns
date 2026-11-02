package com.thiago.pagamentos.chain;

import com.thiago.pagamentos.model.Pagamento;
import com.thiago.pagamentos.saida.Saida;

public class ValorValidator extends ValidadorPagamento {

    @Override
    protected void validarAtual(Pagamento pagamento) {

        if (pagamento.getValor() <= 0) {

            throw new IllegalArgumentException(
                    "O valor do pagamento deve ser maior que zero."
            );
        }

        Saida.println("✓ Valor validado.");
    }
}