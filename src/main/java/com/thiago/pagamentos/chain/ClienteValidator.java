package com.thiago.pagamentos.chain;

import com.thiago.pagamentos.model.Pagamento;
import com.thiago.pagamentos.saida.Saida;

public class ClienteValidator extends ValidadorPagamento {

    @Override
    protected void validarAtual(Pagamento pagamento) {

        if (pagamento.getCliente() == null ||
                pagamento.getCliente().isBlank()) {

            throw new IllegalArgumentException(
                    "Cliente não informado."
            );
        }

        Saida.println("✓ Cliente validado.");
    }
}