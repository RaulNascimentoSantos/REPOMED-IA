# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e7]:
    - generic [ref=e8]:
      - img [ref=e10]
      - heading "RepoMed IA" [level=1] [ref=e12]
      - paragraph [ref=e13]: Sistema Médico Enterprise v4.0
    - generic [ref=e14]:
      - generic [ref=e15]:
        - generic [ref=e16]: Email Médico
        - generic [ref=e17]:
          - img [ref=e18]
          - textbox "dr.silva@repomed.com.br" [ref=e21]
      - generic [ref=e22]:
        - generic [ref=e23]: Senha
        - generic [ref=e24]:
          - img [ref=e25]
          - textbox "••••••••••••" [ref=e29]: RepoMed2025!
          - button [ref=e30] [cursor=pointer]:
            - img [ref=e31] [cursor=pointer]
      - generic [ref=e34]:
        - generic [ref=e35]:
          - checkbox "Lembrar de mim" [ref=e36]
          - generic [ref=e37]: Lembrar de mim
        - link "Esqueci a senha" [ref=e38] [cursor=pointer]:
          - /url: "#"
      - button "Entrar no Sistema" [ref=e39] [cursor=pointer]
    - generic [ref=e40]:
      - paragraph [ref=e41]: DEMO CREDENTIALS
      - paragraph [ref=e42]:
        - strong [ref=e43]: "Email:"
        - text: dr.silva@repomed.com.br
      - paragraph [ref=e44]:
        - strong [ref=e45]: "Senha:"
        - text: RepoMed2025!
      - paragraph [ref=e46]: Já preenchidos automaticamente
```