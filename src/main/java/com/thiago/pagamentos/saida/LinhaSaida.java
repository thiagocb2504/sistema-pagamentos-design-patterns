package com.thiago.pagamentos.saida;

/**
 * Uma linha impressa durante a execução.
 *
 * @param padrao   pacote de quem imprimiu (chain, factory, strategy, adapter, model ou sistema)
 * @param origem   nome simples da classe que imprimiu
 * @param mensagem texto impresso
 * @param nivel    info, sucesso (começa com ✓) ou erro (✗ / Motivo)
 */
public record LinhaSaida(String padrao, String origem, String mensagem, String nivel) {

    static LinhaSaida de(Class<?> classe, String mensagem) {

        String pacote = classe.getPackageName();
        String padrao = pacote.substring(pacote.lastIndexOf('.') + 1);

        // Classes na raiz (Main, ProcessadorPagamento) representam o sistema como um todo.
        if (padrao.equals("pagamentos")) {
            padrao = "sistema";
        }

        String nivel = "info";

        if (mensagem.startsWith("✓")) {
            nivel = "sucesso";
        } else if (mensagem.startsWith("✗") || mensagem.startsWith("Motivo:")) {
            nivel = "erro";
        }

        return new LinhaSaida(padrao, classe.getSimpleName(), mensagem, nivel);
    }
}
