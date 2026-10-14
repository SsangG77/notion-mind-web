import type { Lang } from "@/lib/i18n";

interface Section {
  heading: string;
  body: string[];
}
interface Copy {
  title: string;
  lead: string;
  shotAlt: string;
  shotCaption: string;
  sections: Section[];
  cta: string;
}

// 예시 화면 설명. 위 그래프에 실제로 보이는 것만 적는다 — 없는 기능을 적지 않는다
export const DEMO_COPY: Record<Lang, Copy> = {
  en: {
    title: "An example workspace, drawn from its relation properties",
    shotAlt:
      "A Notion workspace drawn as a graph. Database nodes for Projects, Meetings, Clients, Releases and Documents, with their pages around them, solid lines for membership and dotted lines for relation properties.",
    shotCaption:
      "The same example at a glance: five databases, their pages, and the relation properties running between them.",
    lead: "The graph above is a Notion workspace of the kind a small product team keeps: a Projects database, with Meetings, Clients, Releases and Documents beside it. Nothing here is imported from a real company. You can drag, zoom and open the nodes exactly as you would with your own workspace, without signing in.",
    sections: [
      {
        heading: "What the lines mean",
        body: [
          "A solid line means one thing lives inside another. The Projects database and the pages inside it are joined that way, and so is a page nested in another page. That is the structure the Notion sidebar already shows you as a tree.",
          "A dotted line is a relation property. Northwind Trading is dotted to the onboarding project because somebody filled in a relation field, and the same dotted line runs from that project to release 2.4 and to its spec. Those are the connections a sidebar cannot draw, and they are the reason this view exists.",
        ],
      },
      {
        heading: "Hovering is the part that does the work",
        body: [
          "Put the cursor on a node and everything it is not connected to fades out. On a workspace with a few hundred pages that is the difference between a readable map and a hairball. Hover the Projects database and you see its five projects; hover one project and you see the client, the release, the spec and every meeting that discussed it.",
          "Click a node and a panel opens on the right with its properties, its related pages and a preview of the body, while the graph stays where it is.",
        ],
      },
      {
        heading: "Pinning and hiding",
        body: [
          "Drag a node where you want it and the rest settles around it. Right-click gives you Pin, which freezes it in place while the physics keeps running for everything else, and Hide, which takes it out of the view. On the Free plan those choices last for the session; on Pro they are stored and follow you to another browser.",
        ],
      },
      {
        heading: "Finding what is not connected",
        body: [
          "Open the filter next to the search box and turn on \"Only unconnected\". Two pages survive in this example, Scratchpad and Useful links, because no relation property points at them. On a real workspace that filter is how you find the pages that were supposed to be attached to a project and never were.",
          "It counts relation properties, not lines in general. A page inside a database always has its membership line, so counting every connection would never surface anything.",
        ],
      },
      {
        heading: "What happens with your own workspace",
        body: [
          "Signing in reads your pages through Notion's API and draws the same view. Nothing about your workspace is stored on our servers; the titles, properties and relations are passed to your browser and kept there. Large workspaces arrive a hundred pages at a time because Notion's API will not go faster, so the graph fills in while you watch.",
        ],
      },
    ],
    cta: "Open my own workspace",
  },
  ko: {
    title: "관계형 속성으로 그린 예시 워크스페이스",
    shotAlt:
      "노션 워크스페이스를 그래프로 그린 화면. 프로젝트, 회의, 고객, 릴리스, 문서 데이터베이스 노드와 그 안의 페이지들이 실선 소속과 점선 관계형으로 이어져 있다.",
    shotCaption:
      "같은 예시를 한눈에. 데이터베이스 다섯 개와 그 안의 페이지들, 그 사이를 잇는 관계형 속성.",
    lead: "위 그래프는 작은 제품 팀이 흔히 쓰는 모양의 노션 워크스페이스입니다. 프로젝트 데이터베이스를 가운데 두고 회의, 고객, 릴리스, 문서가 옆에 붙어 있습니다. 실제 회사의 자료는 하나도 없습니다. 로그인하지 않아도 끌고, 확대하고, 노드를 열어 보는 것까지 자기 워크스페이스에서와 똑같이 할 수 있습니다.",
    sections: [
      {
        heading: "선이 뜻하는 것",
        body: [
          "실선은 무엇이 무엇 안에 들어 있다는 뜻입니다. 프로젝트 데이터베이스와 그 안의 페이지들이 그렇게 이어져 있고, 페이지 안의 하위 페이지도 같습니다. 노션 사이드바가 이미 트리로 보여주는 그 구조입니다.",
          "점선은 관계형 속성입니다. Northwind Trading 과 온보딩 프로젝트가 점선으로 이어진 건 누군가 관계형 칸을 채워 두었기 때문이고, 같은 점선이 그 프로젝트에서 릴리스 2.4 와 명세 문서로 뻗어 나갑니다. 사이드바가 그려 줄 수 없는 연결이고, 이 화면이 존재하는 이유입니다.",
        ],
      },
      {
        heading: "실제로 일하는 건 호버입니다",
        body: [
          "노드에 커서를 올리면 연결되지 않은 것이 전부 흐려집니다. 페이지가 수백 개인 워크스페이스에서는 이게 읽을 수 있는 지도와 엉킨 실뭉치의 차이입니다. 프로젝트 데이터베이스에 올리면 다섯 개 프로젝트가 보이고, 프로젝트 하나에 올리면 그 고객과 릴리스와 명세와 그걸 다룬 회의가 전부 보입니다.",
          "노드를 클릭하면 오른쪽에 패널이 열려 속성, 연결된 페이지, 본문 미리보기를 보여줍니다. 그동안 그래프는 그대로 있습니다.",
        ],
      },
      {
        heading: "고정과 숨기기",
        body: [
          "노드를 원하는 자리로 끌어다 놓으면 나머지가 그 주위로 정리됩니다. 우클릭하면 핀 고정과 숨기기가 나옵니다. 핀은 그 노드만 제자리에 묶어 두고 나머지 물리는 계속 돌게 하며, 숨기기는 화면에서 빼냅니다. Free 에서는 이 선택이 그 세션 동안만 남고, Pro 에서는 저장되어 다른 브라우저에서도 따라옵니다.",
        ],
      },
      {
        heading: "엮이지 않은 것 찾기",
        body: [
          "검색창 옆 필터를 열고 \"연결 없는 노드만\"을 켜 보세요. 이 예시에서는 Scratchpad 와 Useful links 두 장만 남습니다. 어떤 관계형 속성도 그 둘을 가리키지 않기 때문입니다. 실제 워크스페이스에서는 이 필터가 프로젝트에 붙어 있어야 했는데 끝내 안 붙은 페이지를 찾아내는 방법입니다.",
          "이 필터는 선 전체가 아니라 관계형 속성만 셉니다. 데이터베이스 안의 페이지는 소속선이 항상 붙어 있어서, 연결을 전부 세면 아무것도 걸러지지 않습니다.",
        ],
      },
      {
        heading: "자기 워크스페이스를 열면",
        body: [
          "로그인하면 노션 API 로 페이지를 읽어 같은 화면을 그립니다. 워크스페이스 내용은 회사 서버에 저장하지 않습니다. 제목과 속성과 관계는 브라우저로 전달되어 거기에만 남습니다. 큰 워크스페이스는 노션 API 가 더 빨리 주지 않아서 100개씩 끊어 들어오고, 그래프가 채워지는 걸 보게 됩니다.",
        ],
      },
    ],
    cta: "내 워크스페이스 열어 보기",
  },
};
