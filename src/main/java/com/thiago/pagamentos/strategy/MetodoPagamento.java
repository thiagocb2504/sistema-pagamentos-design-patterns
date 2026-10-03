package com.thiago.pagamentos.strategy;

import com.thiago.pagamentos.model.Pagamento;

public interface MetodoPagamento {

    void pagar(Pagamento pagamento);

}