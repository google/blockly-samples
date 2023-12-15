/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';

export function loadProject() {
  const project = document.getElementById('project-select').value;
  Blockly.serialization.workspaces.load(projectMap.get(project), Blockly.getMainWorkspace());
}

const projectMap = new Map();
projectMap.set('butterfly', {blocks: {blocks: [
  {"type":"p5_setup","id":"5.{;T}3Qv}Awi:1M$:ut","x": 10,"y": 10,"deletable":false,"inputs":{"STATEMENTS":{"block":{"type":"p5_canvas","id":"7tN/x36XFFw-OO~S10|!","deletable":false,"movable":false,"fields":{"WIDTH":400,"HEIGHT":400}}}}},
  {"type":"p5_draw","id":"3iI4f%2#Gmk}=OjI7(8h","x": 10,"y": 70, "deletable":false,"inputs":{"STATEMENTS":{"block":{"type":"p5_stroke","id":"u_/M:dDBrWfCiK:p~K!O","inputs":{"COLOUR":{"shadow":{"type":"colour_picker","id":"_I6rEac**xSXj`s(,;xb","fields":{"COLOUR":"#000000"}}}},"next":{"block":{"type":"p5_fill","id":"k-mgL[a0)MO2+itF_e;(","inputs":{"COLOUR":{"shadow":{"type":"colour_picker","id":"c}n~i{BPBbLtXM#:#rE@","fields":{"COLOUR":"#000000"}}}},"next":{"block":{"type":"p5_ellipse","id":"JH(l3v]CpJ7{[G{59.w|","inputs":{"X":{"shadow":{"type":"math_number","id":"D%9h5~v|2{z%6;`CE1TK","fields":{"NUM":200}}},"Y":{"shadow":{"type":"math_number","id":"0sye!%g1hlq}GnxE$j_%","fields":{"NUM":200}}},"WIDTH":{"shadow":{"type":"math_number","id":"XuX{el}s3P@OPpjbn/a[","fields":{"NUM":30}}},"HEIGHT":{"shadow":{"type":"math_number","id":"sfurC/Jo(0bD]++wq-!0","fields":{"NUM":80}}}},"next":{"block":{"type":"p5_stroke","id":"Q#8(Ho=XnVDjDSk$^%yf","inputs":{"COLOUR":{"shadow":{"type":"colour_picker","id":"Ag%ZWu;_:Ruc{-QJ^/?`","fields":{"COLOUR":"#000000"}}}},"next":{"block":{"type":"p5_line","id":"Dt{j%x03cSt(g_)Q!TDX","inputs":{"X1":{"shadow":{"type":"math_number","id":"92NJg{X~=MZ=#}*CD#J(","fields":{"NUM":200}}},"Y1":{"shadow":{"type":"math_number","id":"CK8tDQc`[50}^di*C2n8","fields":{"NUM":160}}},"X2":{"shadow":{"type":"math_number","id":"QL`a!PHa}]h@DR#GvnD}","fields":{"NUM":180}}},"Y2":{"shadow":{"type":"math_number","id":"hchg50UXE}lzzb9L7Aeg","fields":{"NUM":140}}}},"next":{"block":{"type":"p5_line","id":"I`qib7^QJrlE9SYdQo)+","inputs":{"X1":{"shadow":{"type":"math_number","id":"~-X4Rb2Qw!(DKo:xa(;~","fields":{"NUM":200}}},"Y1":{"shadow":{"type":"math_number","id":"f~|%t[~-nv9PM[OcTy1r","fields":{"NUM":160}}},"X2":{"shadow":{"type":"math_number","id":"4tx}rXA8i5a=R9[zfdhF","fields":{"NUM":220}}},"Y2":{"shadow":{"type":"math_number","id":"R`-ENA~n,i-][QL!`@![","fields":{"NUM":140}}}},"next":{"block":{"type":"p5_stroke","id":"mrzA/bPA$mW07)KyHsQY","inputs":{"COLOUR":{"shadow":{"type":"colour_picker","id":"c)?%]8~7aX!haT_H2edM","fields":{"COLOUR":"#cc33cc"}}}},"next":{"block":{"type":"p5_fill","id":"yi/)`7Y!SAaA%/a^s2Nn","inputs":{"COLOUR":{"shadow":{"type":"colour_picker","id":"z/3?*9(06PhHI0_7Qfr}","fields":{"COLOUR":"#cc33cc"}}}},"next":{"block":{"type":"p5_ellipse","id":"{ELTrO/Ph!B6-hp!m@m/","inputs":{"X":{"shadow":{"type":"math_number","id":"P%)V-IBs`amGlRT2G:38","fields":{"NUM":160}}},"Y":{"shadow":{"type":"math_number","id":"eK),XD+TPQ)~FLA(|ldA","fields":{"NUM":180}}},"WIDTH":{"shadow":{"type":"math_number","id":"Szt+RNk(wJ8{!+)UC{`5","fields":{"NUM":50}}},"HEIGHT":{"shadow":{"type":"math_number","id":"vP!ZyR9E%{P4*?]^nVHb","fields":{"NUM":50}}}},"next":{"block":{"type":"p5_ellipse","id":"R!OpvyGRtRwqz7n?,Tns","inputs":{"X":{"shadow":{"type":"math_number","id":"p8IeF1M/jD8_T^0VvuZ[","fields":{"NUM":165}}},"Y":{"shadow":{"type":"math_number","id":"91mwj^K8}CYSTaM$8;O*","fields":{"NUM":220}}},"WIDTH":{"shadow":{"type":"math_number","id":"x/%XL!zV9nA`$^/uZ6T(","fields":{"NUM":40}}},"HEIGHT":{"shadow":{"type":"math_number","id":"k#dAyU$Np-3jR0z87+^?","fields":{"NUM":30}}}},"next":{"block":{"type":"p5_ellipse","id":"Y%H$:*wQV9B3Vlq0`Rzu","inputs":{"X":{"shadow":{"type":"math_number","id":"2M6ThVZq!-#?W8VvlH+m","fields":{"NUM":240}}},"Y":{"shadow":{"type":"math_number","id":":8Sio!fPy$(Kq2o6rt`c","fields":{"NUM":180}}},"WIDTH":{"shadow":{"type":"math_number","id":"U_$QTQ)|F%r~E:)fj;}B","fields":{"NUM":50}}},"HEIGHT":{"shadow":{"type":"math_number","id":"IC:VRlY34ga^4_49WbP^","fields":{"NUM":50}}}},"next":{"block":{"type":"p5_ellipse","id":"F0A^/ede(cJ[b/p@z[;$","inputs":{"X":{"shadow":{"type":"math_number","id":"xDK;)Hw2p;=!5N6vv%m4","fields":{"NUM":235}}},"Y":{"shadow":{"type":"math_number","id":"8dMco?W9_o7!kivH+fSk","fields":{"NUM":220}}},"WIDTH":{"shadow":{"type":"math_number","id":"#iEG|_HZf6+sd7jnF,SK","fields":{"NUM":40}}},"HEIGHT":{"shadow":{"type":"math_number","id":"TXJYM/cE4]_ZNK^jmf17","fields":{"NUM":30}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}]}});
projectMap.set('smile',
{
    "blocks": {
        "languageVersion": 0,
        "blocks": [
            {
                "type": "p5_setup",
                "id": "5.{;T}3Qv}Awi:1M$:ut",
                "x": 10,
                "y": 10,
                "deletable": false,
                "inputs": {
                    "STATEMENTS": {
                        "block": {
                            "type": "p5_canvas",
                            "id": "7tN/x36XFFw-OO~S10|!",
                            "deletable": false,
                            "movable": false,
                            "fields": {
                                "WIDTH": 400,
                                "HEIGHT": 400
                            }
                        }
                    }
                }
            },
            {
                "type": "p5_draw",
                "id": "3iI4f%2#Gmk}=OjI7(8h",
                "x": 49,
                "y": 110,
                "deletable": false,
                "inputs": {
                    "STATEMENTS": {
                        "block": {
                            "type": "p5_fill",
                            "id": "va^HvDgLMeSgQ.x;gxYb",
                            "inputs": {
                                "COLOUR": {
                                    "shadow": {
                                        "type": "colour_picker",
                                        "id": "zM~)rMRv3q.pOCKqewh8",
                                        "fields": {
                                            "COLOUR": "#ffcc33"
                                        }
                                    }
                                }
                            },
                            "next": {
                                "block": {
                                    "type": "p5_ellipse",
                                    "id": "=4(%t%d-q*ZR5J4)9qC8",
                                    "inputs": {
                                        "X": {
                                            "shadow": {
                                                "type": "math_number",
                                                "id": "#@J{0vrS)eauS1@9!5Ng",
                                                "fields": {
                                                    "NUM": 200
                                                }
                                            }
                                        },
                                        "Y": {
                                            "shadow": {
                                                "type": "math_number",
                                                "id": "CfeSx~%7L1N4=qPz=USH",
                                                "fields": {
                                                    "NUM": 200
                                                }
                                            }
                                        },
                                        "WIDTH": {
                                            "shadow": {
                                                "type": "math_number",
                                                "id": "i^[$MHj}eX{6WC;REOhv",
                                                "fields": {
                                                    "NUM": 100
                                                }
                                            }
                                        },
                                        "HEIGHT": {
                                            "shadow": {
                                                "type": "math_number",
                                                "id": "rGt2W)CEIKKj#:0+nHF8",
                                                "fields": {
                                                    "NUM": 100
                                                }
                                            }
                                        }
                                    },
                                    "next": {
                                        "block": {
                                            "type": "variables_set",
                                            "id": "mQ@ciXV;y}/`F?9@$vjR",
                                            "fields": {
                                                "VAR": {
                                                    "id": "Rw-=M;Q2qUvvC~MW%:#i"
                                                }
                                            },
                                            "inputs": {
                                                "VALUE": {
                                                    "block": {
                                                        "type": "math_arithmetic",
                                                        "id": "@5J[zTol+uO{|hZw6O6a",
                                                        "fields": {
                                                            "OP": "MULTIPLY"
                                                        },
                                                        "inputs": {
                                                            "A": {
                                                                "shadow": {
                                                                    "type": "math_number",
                                                                    "id": "BfL+;cR(?:nZtNCcOL%W",
                                                                    "fields": {
                                                                        "NUM": 1
                                                                    }
                                                                },
                                                                "block": {
                                                                    "type": "math_number",
                                                                    "id": "y|)uvxu+aOKP;of6RI*@",
                                                                    "fields": {
                                                                        "NUM": 0.2
                                                                    }
                                                                }
                                                            },
                                                            "B": {
                                                                "shadow": {
                                                                    "type": "math_number",
                                                                    "id": "N~fj~?z9-#]@*sUWxL:I",
                                                                    "fields": {
                                                                        "NUM": 1
                                                                    }
                                                                },
                                                                "block": {
                                                                    "type": "math_constant",
                                                                    "id": ",~]rbN}0kZE2Lb6kNYpD",
                                                                    "fields": {
                                                                        "CONSTANT": "PI"
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            },
                                            "next": {
                                                "block": {
                                                    "type": "variables_set",
                                                    "id": "e6wF@EjP.e@B5-;6/zJ*",
                                                    "fields": {
                                                        "VAR": {
                                                            "id": "5YB/y7bKU2AY.os#s.6p"
                                                        }
                                                    },
                                                    "inputs": {
                                                        "VALUE": {
                                                            "block": {
                                                                "type": "math_arithmetic",
                                                                "id": "cWuZqB,ydJ0rB}NV.qkO",
                                                                "fields": {
                                                                    "OP": "MULTIPLY"
                                                                },
                                                                "inputs": {
                                                                    "A": {
                                                                        "shadow": {
                                                                            "type": "math_number",
                                                                            "id": "BfL+;cR(?:nZtNCcOL%W",
                                                                            "fields": {
                                                                                "NUM": 1
                                                                            }
                                                                        },
                                                                        "block": {
                                                                            "type": "math_number",
                                                                            "id": "f)`V1xs7kfO|G$Q!MIn!",
                                                                            "fields": {
                                                                                "NUM": 0.8
                                                                            }
                                                                        }
                                                                    },
                                                                    "B": {
                                                                        "shadow": {
                                                                            "type": "math_number",
                                                                            "id": "N~fj~?z9-#]@*sUWxL:I",
                                                                            "fields": {
                                                                                "NUM": 1
                                                                            }
                                                                        },
                                                                        "block": {
                                                                            "type": "math_constant",
                                                                            "id": "(Upk}5/8*SKpcODSQ,y:",
                                                                            "fields": {
                                                                                "CONSTANT": "PI"
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    "next": {
                                                        "block": {
                                                            "type": "p5_arc",
                                                            "id": "eDM25dizb3nBrRQ~q/*L",
                                                            "inputs": {
                                                                "X": {
                                                                    "shadow": {
                                                                        "type": "math_number",
                                                                        "id": "YX)_~meN%uj9mqJR^iwH",
                                                                        "fields": {
                                                                            "NUM": 200
                                                                        }
                                                                    }
                                                                },
                                                                "Y": {
                                                                    "shadow": {
                                                                        "type": "math_number",
                                                                        "id": "B%L@qM=+t..#}t3ib%uf",
                                                                        "fields": {
                                                                            "NUM": 200
                                                                        }
                                                                    }
                                                                },
                                                                "WIDTH": {
                                                                    "shadow": {
                                                                        "type": "math_number",
                                                                        "id": "-)uxLowzM!69k08Key+=",
                                                                        "fields": {
                                                                            "NUM": 60
                                                                        }
                                                                    }
                                                                },
                                                                "HEIGHT": {
                                                                    "shadow": {
                                                                        "type": "math_number",
                                                                        "id": "$[IDA}!wHdEG}F_4Ytyy",
                                                                        "fields": {
                                                                            "NUM": 60
                                                                        }
                                                                    }
                                                                },
                                                                "START": {
                                                                    "shadow": {
                                                                        "type": "math_number",
                                                                        "id": "6NjTNAfLCEP7m#MOSO_~",
                                                                        "fields": {
                                                                            "NUM": 1
                                                                        }
                                                                    },
                                                                    "block": {
                                                                        "type": "variables_get",
                                                                        "id": "6y8A9saOy.$1n)?yR|2K",
                                                                        "fields": {
                                                                            "VAR": {
                                                                                "id": "Rw-=M;Q2qUvvC~MW%:#i"
                                                                            }
                                                                        }
                                                                    }
                                                                },
                                                                "STOP": {
                                                                    "shadow": {
                                                                        "type": "math_number",
                                                                        "id": "*:):Zy,trof_?mS]0uh0",
                                                                        "fields": {
                                                                            "NUM": 2
                                                                        }
                                                                    },
                                                                    "block": {
                                                                        "type": "variables_get",
                                                                        "id": ")=j|~~HpC5E67%711jNg",
                                                                        "fields": {
                                                                            "VAR": {
                                                                                "id": "5YB/y7bKU2AY.os#s.6p"
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            },
                                                            "next": {
                                                                "block": {
                                                                    "type": "p5_fill",
                                                                    "id": "+/EXAoaF9M)`Kp(5E:Ar",
                                                                    "inputs": {
                                                                        "COLOUR": {
                                                                            "shadow": {
                                                                                "type": "colour_picker",
                                                                                "id": "xi~sT.Fq/a-U#UMKoACs",
                                                                                "fields": {
                                                                                    "COLOUR": "#000000"
                                                                                }
                                                                            }
                                                                        }
                                                                    },
                                                                    "next": {
                                                                        "block": {
                                                                            "type": "p5_ellipse",
                                                                            "id": "C5GD6:aC{;NujQsTO^KH",
                                                                            "inputs": {
                                                                                "X": {
                                                                                    "shadow": {
                                                                                        "type": "math_number",
                                                                                        "id": ":(DCuxkw5bv%,CBFfHcc",
                                                                                        "fields": {
                                                                                            "NUM": 180
                                                                                        }
                                                                                    }
                                                                                },
                                                                                "Y": {
                                                                                    "shadow": {
                                                                                        "type": "math_number",
                                                                                        "id": "^}WiM?[/H$8GIJ~dro$p",
                                                                                        "fields": {
                                                                                            "NUM": 180
                                                                                        }
                                                                                    }
                                                                                },
                                                                                "WIDTH": {
                                                                                    "shadow": {
                                                                                        "type": "math_number",
                                                                                        "id": "~]TBO.T#Ly1KdLr%/-|O",
                                                                                        "fields": {
                                                                                            "NUM": 10
                                                                                        }
                                                                                    }
                                                                                },
                                                                                "HEIGHT": {
                                                                                    "shadow": {
                                                                                        "type": "math_number",
                                                                                        "id": "xKUOhKDf2u#*MONP1x6J",
                                                                                        "fields": {
                                                                                            "NUM": 10
                                                                                        }
                                                                                    }
                                                                                }
                                                                            },
                                                                            "next": {
                                                                                "block": {
                                                                                    "type": "p5_ellipse",
                                                                                    "id": "sX$RaCN^YMXu#l?2V?kf",
                                                                                    "inputs": {
                                                                                        "X": {
                                                                                            "shadow": {
                                                                                                "type": "math_number",
                                                                                                "id": "r3zNB#2rFC`#h^C{=BF_",
                                                                                                "fields": {
                                                                                                    "NUM": 220
                                                                                                }
                                                                                            }
                                                                                        },
                                                                                        "Y": {
                                                                                            "shadow": {
                                                                                                "type": "math_number",
                                                                                                "id": "shve}nh#-hF{fqv+Dp5!",
                                                                                                "fields": {
                                                                                                    "NUM": 180
                                                                                                }
                                                                                            }
                                                                                        },
                                                                                        "WIDTH": {
                                                                                            "shadow": {
                                                                                                "type": "math_number",
                                                                                                "id": "Q+r=nElk+:-(R}Nw;{S%",
                                                                                                "fields": {
                                                                                                    "NUM": 10
                                                                                                }
                                                                                            }
                                                                                        },
                                                                                        "HEIGHT": {
                                                                                            "shadow": {
                                                                                                "type": "math_number",
                                                                                                "id": "Y/P]rl(}$W$xH{y02byN",
                                                                                                "fields": {
                                                                                                    "NUM": 10
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]
    },
    "variables": [
        {
            "name": "startAngle",
            "id": "Rw-=M;Q2qUvvC~MW%:#i"
        },
        {
            "name": "endAngle",
            "id": "5YB/y7bKU2AY.os#s.6p"
        }
    ]
});
