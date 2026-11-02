package com.thiago.pagamentos.saida;

import java.util.ArrayList;
import java.util.List;

/**
 * Substitui o System.out nas classes do sistema.
 *
 * Tudo continua sendo impresso no console, como antes. Quando uma execução
 * está sendo capturada (pela API), cada linha também é registrada junto com a
 * classe e o pacote que a imprimiu — é isso que o simulador usa para mostrar
 * qual padrão agiu em cada etapa.
 *
 * A captura usa ThreadLocal, então requisições simultâneas não se misturam.
 */
public final class Saida {

    private static final StackWalker STACK =
            StackWalker.getInstance(StackWalker.Option.RETAIN_CLASS_REFERENCE);

    private static final ThreadLocal<List<LinhaSaida>> CAPTURA =
            new ThreadLocal<>();

    private Saida() {
    }

    public static void println(String mensagem) {
        registrar(STACK.getCallerClass(), mensagem);
    }

    public static void printf(String formato, Object... args) {
        registrar(STACK.getCallerClass(), String.format(formato, args));
    }

    public static void iniciarCaptura() {
        CAPTURA.set(new ArrayList<>());
    }

    public static List<LinhaSaida> finalizarCaptura() {
        List<LinhaSaida> linhas = CAPTURA.get();
        CAPTURA.remove();

        return linhas == null ? List.of() : linhas;
    }

    private static void registrar(Class<?> origem, String mensagem) {

        System.out.print(mensagem.endsWith("\n") ? mensagem : mensagem + "\n");

        List<LinhaSaida> linhas = CAPTURA.get();

        if (linhas == null) {
            return;
        }

        // Quebras de linha usadas só para espaçar o console não interessam à interface.
        for (String linha : mensagem.strip().split("\\R")) {
            linhas.add(LinhaSaida.de(origem, linha));
        }
    }
}
