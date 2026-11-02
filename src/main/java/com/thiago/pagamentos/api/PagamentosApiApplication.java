package com.thiago.pagamentos.api;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PagamentosApiApplication {

    public static void main(String[] args) throws IOException {
        contornarSocketLocalNoWindows();
        SpringApplication.run(PagamentosApiApplication.class, args);
    }

    /**
     * Em algumas máquinas Windows o JDK não consegue criar o socket local
     * (AF_UNIX) dentro da pasta TEMP, e o Tomcat não sobe com
     * "Unable to establish loopback connection". Apontar o JDK para outra
     * pasta resolve. Precisa rodar antes de qualquer Selector ser aberto.
     */
    private static void contornarSocketLocalNoWindows() throws IOException {

        boolean windows = System.getProperty("os.name").startsWith("Windows");

        if (!windows || System.getProperty("jdk.net.unixdomain.tmpdir") != null) {
            return;
        }

        Path pasta = Path.of(System.getProperty("user.home"), ".sistema-pagamentos", "tmp");
        Files.createDirectories(pasta);
        System.setProperty("jdk.net.unixdomain.tmpdir", pasta.toString());
    }
}
