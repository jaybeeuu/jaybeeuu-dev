# scripts

CLI scripts (really only one) used to automate setup of the repo.

## gen-certs

Generates SSL certificates for local development using [devcert](https://github.com/davewasmer/devcert).

| Option    | Description                                                 | Default     |
| --------- | ----------------------------------------------------------- | ----------- |
| domain    | The domain for which the certificates should be generated.  | "localhost" |
| directory | The output directory where teh certificate will be written. | "./certs"   |
| certName  | The name the certificate file will have.                    | "cert.crt"  |
| keyName   | THe name the key file will have.                            | "key.key"   |
| caName    | The name the certificate authority file will have.          | "ca.pem"    |