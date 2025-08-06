import type { Flow, Session } from "@/types/flow";

export const mockFlow: Flow = {
  id: "mock-flow",
  title: "Integração de Novo Funcionário",
  status: "DRAFT",
  steps: [
    {
      id: "step1",
      order: 1,
      type: "TEXT",
      title: "Preparar computador",
      content: "Preparar computador antes do funcionário chegar.",
      nextStepId: "step2",
    },
    {
      id: "step2",
      order: 2,
      type: "TEXT",
      title: "Instalar IDE",
      content: "Instalar IDE (VS CODE, CURSOR…).",
      nextStepId: "step3",
    },
    {
      id: "step3",
      order: 3,
      type: "QUESTION",
      title: "Programador?",
      content: "O novo funcionário é programador?",
      options: [
        { id: "option1", label: "Sim", targetStepId: "step4" },
        { id: "option2", label: "Não", targetStepId: "step5" },
      ],
    },
    {
      id: "step4",
      order: 4,
      type: "TEXT",
      title: "Acesso de Admin",
      content: "Dar acesso de Admin ao programador.",
      nextStepId: "step5",
    },
    {
      id: "step5",
      order: 5,
      type: "TEXT",
      title: "Configuração da VPN",
      content: "Configurar a VPN da AWS e escritório.",
      nextStepId: "step6",
    },
    {
      id: "step6",
      order: 6,
      type: "TEXT",
      title: "Instruções de Segurança",
      content: "Passar instruções de segurança para o novo desenvolvedor.",
      nextStepId: "step7",
    },
    {
      id: "step7",
      order: 7,
      type: "TEXT",
      title: "Teste Técnico",
      content: "Passar teste técnico para o novo funcionário.",
      nextStepId: "step8",
    },
    {
      id: "step8",
      order: 8,
      type: "TEXT",
      title: "Reunião com a equipe",
      content: "Reunião breve com a equipe de tecnologia.",
      nextStepId: "step9",
    },
    {
      id: "step9",
      order: 9,
      type: "TEXT",
      title: "Reunião com PO",
      content: "Reunião com PO para apresentação do produto.",
      nextStepId: "step10",
    },
    {
      id: "step10",
      order: 10,
      type: "TEXT",
      title: "Enviar Documentos",
      content: "Enviar documentos sobre o negócio.",
      nextStepId: "step11",
    },
    {
      id: "step11",
      order: 11,
      type: "TEXT",
      title: "Enviar Áudio",
      content: "Enviar áudio explicando sobre as ferramentas.",
      nextStepId: "step12",
    },
    {
      id: "step12",
      order: 12,
      type: "TEXT",
      title: "Enviar PDF",
      content: "Enviar PDF explicando 100% do negócio.",
    },
  ],
  networkGraph: [
    { source: "step1", target: "step2" },
    { source: "step2", target: "step3" },
    { source: "step3", target: "step4" },
    { source: "step3", target: "step5" },
    { source: "step4", target: "step5" },
    { source: "step5", target: "step6" },
    { source: "step6", target: "step7" },
    { source: "step7", target: "step8" },
    { source: "step8", target: "step9" },
    { source: "step9", target: "step10" },
    { source: "step10", target: "step11" },
    { source: "step11", target: "step12" },
  ],
  visits: 10,
  completions: 8,
  updatedAt: Date.now(),
};

export const mockSessions: Session[] = [
  {
    "id": "sess1",
    "flowId": "mock-flow",
    "startedAt": 1754363732822,
    "finishedAt": 1754366192822,
    "path": [
      { "id": "step1", "title": "Preparar computador", "enterAt": 1754363732822, "leaveAt": 1754364032822, "timeSpent": 300000 },
      { "id": "step2", "title": "Instalar IDE", "enterAt": 1754364032822, "leaveAt": 1754364212822, "timeSpent": 180000 },
      { "id": "step3", "title": "Programador?", "enterAt": 1754364212822, "leaveAt": 1754364332822, "timeSpent": 120000 },
      { "id": "step4", "title": "Acesso de Admin", "enterAt": 1754364332822, "leaveAt": 1754364572822, "timeSpent": 240000 },
      { "id": "step5", "title": "Configuração da VPN", "enterAt": 1754364572822, "leaveAt": 1754364932822, "timeSpent": 360000 },
      { "id": "step6", "title": "Instruções de Segurança", "enterAt": 1754364932822, "leaveAt": 1754365112822, "timeSpent": 180000 },
      { "id": "step7", "title": "Teste Técnico", "enterAt": 1754365112822, "leaveAt": 1754365412822, "timeSpent": 300000 },
      { "id": "step8", "title": "Reunião com a equipe", "enterAt": 1754365412822, "leaveAt": 1754365532822, "timeSpent": 120000 },
      { "id": "step9", "title": "Reunião com PO", "enterAt": 1754365532822, "leaveAt": 1754365712822, "timeSpent": 180000 },
      { "id": "step10", "title": "Enviar Documentos", "enterAt": 1754365712822, "leaveAt": 1754365952822, "timeSpent": 240000 },
      { "id": "step11", "title": "Enviar Áudio", "enterAt": 1754365952822, "leaveAt": 1754366072822, "timeSpent": 120000 },
      { "id": "step12", "title": "Enviar PDF", "enterAt": 1754366072822, "leaveAt": 1754366192822, "timeSpent": 120000 }
    ],
    "currentIndex": -1,
    "history": []
  },
  {
    "id": "sess2",
    "flowId": "mock-flow",
    "startedAt": 1754277332822,
    "finishedAt": 1754283692822,
    "path": [
      { "id": "step1", "title": "Preparar computador", "enterAt": 1754277332822, "leaveAt": 1754277932822, "timeSpent": 600000 },
      { "id": "step2", "title": "Instalar IDE", "enterAt": 1754277932822, "leaveAt": 1754278292822, "timeSpent": 360000 },
      { "id": "step3", "title": "Programador?", "enterAt": 1754278292822, "leaveAt": 1754278532822, "timeSpent": 240000 },
      { "id": "step4", "title": "Acesso de Admin", "enterAt": 1754278532822, "leaveAt": 1754279012822, "timeSpent": 480000 },
      { "id": "step5", "title": "Configuração da VPN", "enterAt": 1754279012822, "leaveAt": 1754279732822, "timeSpent": 720000 },
      { "id": "step6", "title": "Instruções de Segurança", "enterAt": 1754279732822, "leaveAt": 1754280092822, "timeSpent": 360000 },
      { "id": "step7", "title": "Teste Técnico", "enterAt": 1754280092822, "leaveAt": 1754280692822, "timeSpent": 600000 },
      { "id": "step8", "title": "Reunião com a equipe", "enterAt": 1754280692822, "leaveAt": 1754280932822, "timeSpent": 240000 },
      { "id": "step9", "title": "Reunião com PO", "enterAt": 1754280932822, "leaveAt": 1754281412822, "timeSpent": 480000 },
      { "id": "step10", "title": "Enviar Documentos", "enterAt": 1754281412822, "leaveAt": 1754282132822, "timeSpent": 720000 },
      { "id": "step11", "title": "Enviar Áudio", "enterAt": 1754282132822, "leaveAt": 1754282372822, "timeSpent": 240000 },
      { "id": "step12", "title": "Enviar PDF", "enterAt": 1754282372822, "leaveAt": 1754282612822, "timeSpent": 240000 }
    ],
    "currentIndex": -1,
    "history": []
  },
  {
    "id": "sess3",
    "flowId": "mock-flow",
    "startedAt": 1754190932822,
    "finishedAt": 1754201732822,
    "path": [
      { "id": "step1", "title": "Preparar computador", "enterAt": 1754190932822, "leaveAt": 1754191532822, "timeSpent": 900000 },
      { "id": "step2", "title": "Instalar IDE", "enterAt": 1754191532822, "leaveAt": 1754191892822, "timeSpent": 540000 },
      { "id": "step3", "title": "Programador?", "enterAt": 1754191892822, "leaveAt": 1754192132822, "timeSpent": 360000 },
      { "id": "step4", "title": "Acesso de Admin", "enterAt": 1754192132822, "leaveAt": 1754192612822, "timeSpent": 720000 },
      { "id": "step5", "title": "Configuração da VPN", "enterAt": 1754192612822, "leaveAt": 1754193332822, "timeSpent": 1080000 },
      { "id": "step6", "title": "Instruções de Segurança", "enterAt": 1754193332822, "leaveAt": 1754193692822, "timeSpent": 540000 },
      { "id": "step7", "title": "Teste Técnico", "enterAt": 1754193692822, "leaveAt": 1754194292822, "timeSpent": 900000 },
      { "id": "step8", "title": "Reunião com a equipe", "enterAt": 1754194292822, "leaveAt": 1754194532822, "timeSpent": 360000 },
      { "id": "step9", "title": "Reunião com PO", "enterAt": 1754194532822, "leaveAt": 1754195012822, "timeSpent": 720000 },
      { "id": "step10", "title": "Enviar Documentos", "enterAt": 1754195012822, "leaveAt": 1754195732822, "timeSpent": 1080000 },
      { "id": "step11", "title": "Enviar Áudio", "enterAt": 1754195732822, "leaveAt": 1754195972822, "timeSpent": 360000 },
      { "id": "step12", "title": "Enviar PDF", "enterAt": 1754195972822, "leaveAt": 1754196212822, "timeSpent": 360000 }
    ],
    "currentIndex": -1,
    "history": []
  },
  {
    "id": "sess4",
    "flowId": "mock-flow",
    "startedAt": 1754104532822,
    "finishedAt": 1754106692822,
    "path": [
      { "id": "step1", "title": "Preparar computador", "enterAt": 1754104532822, "leaveAt": 1754104832822, "timeSpent": 300000 },
      { "id": "step2", "title": "Instalar IDE", "enterAt": 1754104832822, "leaveAt": 1754105012822, "timeSpent": 180000 },
      { "id": "step3", "title": "Programador?", "enterAt": 1754105012822, "leaveAt": 1754105132822, "timeSpent": 120000 },
      { "id": "step4", "title": "Acesso de Admin", "enterAt": 1754105132822, "leaveAt": 1754105372822, "timeSpent": 240000 },
      { "id": "step5", "title": "Configuração da VPN", "enterAt": 1754105372822, "leaveAt": 1754105732822, "timeSpent": 360000 },
      { "id": "step6", "title": "Instruções de Segurança", "enterAt": 1754105732822, "leaveAt": 1754105912822, "timeSpent": 180000 },
      { "id": "step7", "title": "Teste Técnico", "enterAt": 1754105912822, "leaveAt": 1754106212822, "timeSpent": 300000 },
      { "id": "step8", "title": "Reunião com a equipe", "enterAt": 1754106212822, "leaveAt": 1754106332822, "timeSpent": 120000 },
      { "id": "step9", "title": "Reunião com PO", "enterAt": 1754106332822, "leaveAt": 1754106512822, "timeSpent": 180000 },
      { "id": "step10", "title": "Enviar Documentos", "enterAt": 1754106512822, "leaveAt": 1754106752822, "timeSpent": 240000 },
      { "id": "step11", "title": "Enviar Áudio", "enterAt": 1754106752822, "leaveAt": 1754106872822, "timeSpent": 120000 },
      { "id": "step12", "title": "Enviar PDF", "enterAt": 1754106872822, "leaveAt": 1754106992822, "timeSpent": 120000 }
    ],
    "currentIndex": -1,
    "history": []
  },
  {
    "id": "sess5",
    "flowId": "mock-flow",
    "startedAt": 1754018132822,
    "finishedAt": 1754033012822,
    "path": [
      { "id": "step1", "title": "Preparar computador", "enterAt": 1754018132822, "leaveAt": 1754019332822, "timeSpent": 720000 },
      { "id": "step2", "title": "Instalar IDE", "enterAt": 1754019332822, "leaveAt": 1754019932822, "timeSpent": 360000 },
      { "id": "step3", "title": "Programador?", "enterAt": 1754019932822, "leaveAt": 1754020292822, "timeSpent": 240000 },
      { "id": "step4", "title": "Acesso de Admin", "enterAt": 1754020292822, "leaveAt": 1754020772822, "timeSpent": 480000 },
      { "id": "step5", "title": "Configuração da VPN", "enterAt": 1754020772822, "leaveAt": 1754021732822, "timeSpent": 960000 },
      { "id": "step6", "title": "Instruções de Segurança", "enterAt": 1754021732822, "leaveAt": 1754022092822, "timeSpent": 360000 },
      { "id": "step7", "title": "Teste Técnico", "enterAt": 1754022092822, "leaveAt": 1754022692822, "timeSpent": 600000 },
      { "id": "step8", "title": "Reunião com a equipe", "enterAt": 1754022692822, "leaveAt": 1754022932822, "timeSpent": 240000 },
      { "id": "step9", "title": "Reunião com PO", "enterAt": 1754022932822, "leaveAt": 1754023412822, "timeSpent": 480000 },
      { "id": "step10", "title": "Enviar Documentos", "enterAt": 1754023412822, "leaveAt": 1754024372822, "timeSpent": 960000 },
      { "id": "step11", "title": "Enviar Áudio", "enterAt": 1754024372822, "leaveAt": 1754024612822, "timeSpent": 240000 },
      { "id": "step12", "title": "Enviar PDF", "enterAt": 1754024612822, "leaveAt": 1754024852822, "timeSpent": 240000 }
    ],
    "currentIndex": -1,
    "history": []
  },
  {
    "id": "sess6",
    "flowId": "mock-flow",
    "startedAt": 1753931732822,
    "finishedAt": 1753948532822,
    "path": [
      { "id": "step1", "title": "Preparar computador", "enterAt": 1753931732822, "leaveAt": 1753933232822, "timeSpent": 900000 },
      { "id": "step2", "title": "Instalar IDE", "enterAt": 1753933232822, "leaveAt": 1753934132822, "timeSpent": 540000 },
      { "id": "step3", "title": "Programador?", "enterAt": 1753934132822, "leaveAt": 1753934732822, "timeSpent": 600000 },
      { "id": "step4", "title": "Acesso de Admin", "enterAt": 1753934732822, "leaveAt": 1753935932822, "timeSpent": 1200000 },
      { "id": "step5", "title": "Configuração da VPN", "enterAt": 1753935932822, "leaveAt": 1753937732822, "timeSpent": 1800000 },
      { "id": "step6", "title": "Instruções de Segurança", "enterAt": 1753937732822, "leaveAt": 1753938632822, "timeSpent": 540000 },
      { "id": "step7", "title": "Teste Técnico", "enterAt": 1753938632822, "leaveAt": 1753940132822, "timeSpent": 900000 },
      { "id": "step8", "title": "Reunião com a equipe", "enterAt": 1753940132822, "leaveAt": 1753940732822, "timeSpent": 600000 },
      { "id": "step9", "title": "Reunião com PO", "enterAt": 1753940732822, "leaveAt": 1753941632822, "timeSpent": 900000 },
      { "id": "step10", "title": "Enviar Documentos", "enterAt": 1753941632822, "leaveAt": 1753942832822, "timeSpent": 1200000 },
      { "id": "step11", "title": "Enviar Áudio", "enterAt": 1753942832822, "leaveAt": 1753943432822, "timeSpent": 600000 },
      { "id": "step12", "title": "Enviar PDF", "enterAt": 1753943432822, "leaveAt": 1753944032822, "timeSpent": 600000 }
    ],
    "currentIndex": -1,
    "history": []
  },
  {
    "id": "sess7",
    "flowId": "mock-flow",
    "startedAt": 1753845332822,
    "finishedAt": 1753847792822,
    "path": [
      { "id": "step1", "title": "Preparar computador", "enterAt": 1753845332822, "leaveAt": 1753845632822, "timeSpent": 300000 },
      { "id": "step2", "title": "Instalar IDE", "enterAt": 1753845632822, "leaveAt": 1753845812822, "timeSpent": 180000 },
      { "id": "step3", "title": "Programador?", "enterAt": 1753845812822, "leaveAt": 1753845932822, "timeSpent": 120000 },
      { "id": "step4", "title": "Acesso de Admin", "enterAt": 1753845932822, "leaveAt": 1753846172822, "timeSpent": 240000 },
      { "id": "step5", "title": "Configuração da VPN", "enterAt": 1753846172822, "leaveAt": 1753846532822, "timeSpent": 360000 },
      { "id": "step6", "title": "Instruções de Segurança", "enterAt": 1753846532822, "leaveAt": 1753846712822, "timeSpent": 180000 },
      { "id": "step7", "title": "Teste Técnico", "enterAt": 1753846712822, "leaveAt": 1753847012822, "timeSpent": 300000 },
      { "id": "step8", "title": "Reunião com a equipe", "enterAt": 1753847012822, "leaveAt": 1753847132822, "timeSpent": 120000 },
      { "id": "step9", "title": "Reunião com PO", "enterAt": 1753847132822, "leaveAt": 1753847312822, "timeSpent": 180000 },
      { "id": "step10", "title": "Enviar Documentos", "enterAt": 1753847312822, "leaveAt": 1753847552822, "timeSpent": 240000 },
      { "id": "step11", "title": "Enviar Áudio", "enterAt": 1753847552822, "leaveAt": 1753847672822, "timeSpent": 120000 },
      { "id": "step12", "title": "Enviar PDF", "enterAt": 1753847672822, "leaveAt": 1753847792822, "timeSpent": 120000 }
    ],
    "currentIndex": -1,
    "history": []
  },
  {
    "id": "sess8",
    "flowId": "mock-flow",
    "startedAt": 1753758932822,
    "finishedAt": 1753781732822,
    "path": [
      { "id": "step1", "title": "Preparar computador", "enterAt": 1753758932822, "leaveAt": 1753760732822, "timeSpent": 1080000 },
      { "id": "step2", "title": "Instalar IDE", "enterAt": 1753760732822, "leaveAt": 1753761812822, "timeSpent": 648000 },
      { "id": "step3", "title": "Programador?", "enterAt": 1753761812822, "leaveAt": 1753762492822, "timeSpent": 408000 },
      { "id": "step4", "title": "Acesso de Admin", "enterAt": 1753762492822, "leaveAt": 1753764812822, "timeSpent": 1392000 },
      { "id": "step5", "title": "Configuração da VPN", "enterAt": 1753764812822, "leaveAt": 1753767692822, "timeSpent": 1728000 },
      { "id": "step6", "title": "Instruções de Segurança", "enterAt": 1753767692822, "leaveAt": 1753768772822, "timeSpent": 648000 },
      { "id": "step7", "title": "Teste Técnico", "enterAt": 1753768772822, "leaveAt": 1753771172822, "timeSpent": 1440000 },
      { "id": "step8", "title": "Reunião com a equipe", "enterAt": 1753771172822, "leaveAt": 1753772132822, "timeSpent": 960000 },
      { "id": "step9", "title": "Reunião com PO", "enterAt": 1753772132822, "leaveAt": 1753773572822, "timeSpent": 1440000 },
      { "id": "step10", "title": "Enviar Documentos", "enterAt": 1753773572822, "leaveAt": 1753775492822, "timeSpent": 1920000 },
      { "id": "step11", "title": "Enviar Áudio", "enterAt": 1753775492822, "leaveAt": 1753776452822, "timeSpent": 960000 },
      { "id": "step12", "title": "Enviar PDF", "enterAt": 1753776452822, "leaveAt": 1753777412822, "timeSpent": 960000 }
    ],
    "currentIndex": -1,
    "history": []
  },
  {
    "id": "sess9",
    "flowId": "mock-flow",
    "startedAt": 1753672532822,
    "finishedAt": 1753679732822,
    "path": [
      { "id": "step1", "title": "Preparar computador", "enterAt": 1753672532822, "leaveAt": 1753673132822, "timeSpent": 600000 },
      { "id": "step2", "title": "Instalar IDE", "enterAt": 1753673132822, "leaveAt": 1753673492822, "timeSpent": 360000 },
      { "id": "step3", "title": "Programador?", "enterAt": 1753673492822, "leaveAt": 1753673732822, "timeSpent": 240000 },
      { "id": "step4", "title": "Acesso de Admin", "enterAt": 1753673732822, "leaveAt": 1753674212822, "timeSpent": 480000 },
      { "id": "step5", "title": "Configuração da VPN", "enterAt": 1753674212822, "leaveAt": 1753674932822, "timeSpent": 720000 },
      { "id": "step6", "title": "Instruções de Segurança", "enterAt": 1753674932822, "leaveAt": 1753675292822, "timeSpent": 360000 },
      { "id": "step7", "title": "Teste Técnico", "enterAt": 1753675292822, "leaveAt": 1753675892822, "timeSpent": 600000 },
      { "id": "step8", "title": "Reunião com a equipe", "enterAt": 1753675892822, "leaveAt": 1753676132822, "timeSpent": 240000 },
      { "id": "step9", "title": "Reunião com PO", "enterAt": 1753676132822, "leaveAt": 1753676492822, "timeSpent": 360000 },
      { "id": "step10", "title": "Enviar Documentos", "enterAt": 1753676492822, "leaveAt": 1753676972822, "timeSpent": 480000 },
      { "id": "step11", "title": "Enviar Áudio", "enterAt": 1753676972822, "leaveAt": 1753677212822, "timeSpent": 240000 },
      { "id": "step12", "title": "Enviar PDF", "enterAt": 1753677212822, "leaveAt": 1753677452822, "timeSpent": 240000 }
    ],
    "currentIndex": -1,
    "history": []
  },
  {
    "id": "sess10",
    "flowId": "mock-flow",
    "startedAt": 1753586132822,
    "finishedAt": 1753605812822,
    "path": [
      { "id": "step1", "title": "Preparar computador", "enterAt": 1753586132822, "leaveAt": 1753588532822, "timeSpent": 2400000 },
      { "id": "step2", "title": "Instalar IDE", "enterAt": 1753588532822, "leaveAt": 1753589972822, "timeSpent": 1440000 },
      { "id": "step3", "title": "Programador?", "enterAt": 1753589972822, "leaveAt": 1753590932822, "timeSpent": 960000 },
      { "id": "step4", "title": "Acesso de Admin", "enterAt": 1753590932822, "leaveAt": 1753592852822, "timeSpent": 1920000 },
      { "id": "step5", "title": "Configuração da VPN", "enterAt": 1753592852822, "leaveAt": 1753595732822, "timeSpent": 2880000 },
      { "id": "step6", "title": "Instruções de Segurança", "enterAt": 1753595732822, "leaveAt": 1753597172822, "timeSpent": 1440000 },
      { "id": "step7", "title": "Teste Técnico", "enterAt": 1753597172822, "leaveAt": 1753599572822, "timeSpent": 2400000 },
      { "id": "step8", "title": "Reunião com a equipe", "enterAt": 1753599572822, "leaveAt": 1753600532822, "timeSpent": 960000 },
      { "id": "step9", "title": "Reunião com PO", "enterAt": 1753600532822, "leaveAt": 1753601972822, "timeSpent": 1440000 },
      { "id": "step10", "title": "Enviar Documentos", "enterAt": 1753601972822, "leaveAt": 1753603892822, "timeSpent": 1920000 },
      { "id": "step11", "title": "Enviar Áudio", "enterAt": 1753603892822, "leaveAt": 1753604852822, "timeSpent": 960000 },
      { "id": "step12", "title": "Enviar PDF", "enterAt": 1753604852822, "leaveAt": 1753605812822, "timeSpent": 960000 }
    ],
    "currentIndex": -1,
    "history": []
  }
];

export function getMockFlow(id: string): Flow | undefined {
  return id === mockFlow.id ? mockFlow : undefined;
}

export function getMockSessions(flowId: string): Session[] {
  return flowId === mockFlow.id ? mockSessions : [];
}
