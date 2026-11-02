package com.thiago.pagamentos;

/**
 * @param aprovado se o pagamento foi concluído
 * @param motivo   mensagem da exceção, quando recusado
 * @param falhouEm classe que lançou a exceção (ex.: SaldoValidator), quando recusado
 */
public record ResultadoPagamento(boolean aprovado, String motivo, String falhouEm) {

    static ResultadoPagamento sucesso() {
        return new ResultadoPagamento(true, null, null);
    }

    static ResultadoPagamento recusado(Exception e) {

        // O topo da pilha é quem lançou a exceção: um validador ou a fábrica.
        StackTraceElement[] pilha = e.getStackTrace();
        String classe = pilha.length > 0 ? pilha[0].getClassName() : null;
        String falhouEm = classe == null ? null : classe.substring(classe.lastIndexOf('.') + 1);

        return new ResultadoPagamento(false, e.getMessage(), falhouEm);
    }
}
