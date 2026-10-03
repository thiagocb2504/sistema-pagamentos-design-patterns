package com.thiago.pagamentos.chain;

import com.thiago.pagamentos.model.Pagamento;

public class ClienteValidator extends ValidadorPagamento {

    @Override
    protected void validarAtual(Pagamento pagamento) {

        if (pagamento.getCliente() == null ||
                pagamento.getCliente().isBlank()) {

            throw new IllegalArgumentException(
                    "Cliente não informado."
            );
        }

        System.out.println("✓ Cliente validado.");
    }
}