const drawingXml = `<xml>
<variables>
  <variable id="F@~^-bHSYZB|!r,d8KAv">sketch</variable>
  <variable id="1h/!($M#LTD\`C5XjmH-L">i</variable>
  <variable id="IS2wa_zJQB+yW0]:^5ZM">circle positions</variable>
  <variable id="G{j@ec:XlY,64_wlyO!G">circle colors</variable>
  <variable id="4.0w9?Cl+krwxS6=fXQ8">circle size</variable>
  <variable id="ya4E;!y$me~mUjJ$cf|z">circle x</variable>
  <variable id="()Kdhx}GQ07cCE57=X)l">fill</variable>
</variables>
<block type="p5_mouse_clicked_event" id="oa.n1/O1)|Oi~UA#T]1s" x="286" y="-52">
  <field name="CANVAS_NAME" id="F@~^-bHSYZB|!r,d8KAv">sketch</field>
  <statement name="DO">
    <block type="variables_set" id="):65yL/Xa;nr:H*(IH9=">
      <field name="VAR" id="1h/!($M#LTD\`C5XjmH-L">i</field>
      <value name="VALUE">
        <block type="math_number" id="[lYln\`hU,}?5))B4_z_*">
          <field name="NUM">1</field>
        </block>
      </value>
      <next>
        <block type="controls_repeat_ext" id="@Wy;YIl!;#hlj31vKpRY">
          <value name="TIMES">
            <shadow type="math_number" id="VQBc6N86^ueV_:-=7$MU">
              <field name="NUM">9</field>
            </shadow>
          </value>
          <statement name="DO">
            <block type="controls_if" id="|Zp=o@d8eXiC$|IbOhcX">
              <value name="IF0">
                <block type="logic_compare" id="S*Xhy9vc@xc8_xLKe$b1">
                  <field name="OP">LT</field>
                  <value name="A">
                    <block type="p5_dist" id="/-cv|B_YrQsC*+HIM-gX">
                      <value name="POINT_A">
                        <block type="p5_coordinate" id="k5]qD4bBZ_=jzJH@WRNd">
                          <value name="X">
                            <shadow type="math_number" id="Z{L[[X(mv9.Zm1[,z=c!">
                              <field name="NUM">50</field>
                            </shadow>
                            <block type="p5_mouse_x" id="1KsA)2K}M*N{)P((.l/r"/>
                          </value>
                          <value name="Y">
                            <shadow type="math_number" id="K|fME(,n6_nT^Sr.:P.e">
                              <field name="NUM">50</field>
                            </shadow>
                            <block type="p5_mouse_y" id="!nX@/)STKX}b=ctuRFXx"/>
                          </value>
                        </block>
                      </value>
                      <value name="POINT_B">
                        <block type="lists_getIndex" id="P\`buSETph_pu%D5x8-GE">
                          <mutation statement="false" at="true"/>
                          <field name="MODE">GET</field>
                          <field name="WHERE">FROM_START</field>
                          <value name="VALUE">
                            <block type="variables_get" id="Th$Z#o0u-Dr}1YQiM.N{">
                              <field name="VAR" id="IS2wa_zJQB+yW0]:^5ZM">circle positions</field>
                            </block>
                          </value>
                          <value name="AT">
                            <block type="variables_get" id="IL%0LJzm/M-hs??8dF,j">
                              <field name="VAR" id="1h/!($M#LTD\`C5XjmH-L">i</field>
                            </block>
                          </value>
                        </block>
                      </value>
                    </block>
                  </value>
                  <value name="B">
                    <block type="variables_get" id="DWp4nZ.G*6Co:h^x5N+Z">
                      <field name="VAR" id="4.0w9?Cl+krwxS6=fXQ8">circle size</field>
                    </block>
                  </value>
                </block>
              </value>
              <statement name="DO0">
                <block type="variables_set" id="Vc8#JQez6/i}P(8|#@*.">
                  <field name="VAR" id="()Kdhx}GQ07cCE57=X)l">fill</field>
                  <value name="VALUE">
                    <block type="lists_getIndex" id="dc8dK*gAGh^r2MH5z~KB">
                      <mutation statement="false" at="true"/>
                      <field name="MODE">GET</field>
                      <field name="WHERE">FROM_START</field>
                      <value name="VALUE">
                        <block type="variables_get" id="GzV4cBRnMRV)$Qwv2IN^">
                          <field name="VAR" id="G{j@ec:XlY,64_wlyO!G">circle colors</field>
                        </block>
                      </value>
                      <value name="AT">
                        <block type="variables_get" id="qpu*yh-f][kyl7G[Bi%c">
                          <field name="VAR" id="1h/!($M#LTD\`C5XjmH-L">i</field>
                        </block>
                      </value>
                    </block>
                  </value>
                </block>
              </statement>
              <next>
                <block type="math_change" id="4Cl(z%:f+]g^1g0F79lE">
                  <field name="VAR" id="1h/!($M#LTD\`C5XjmH-L">i</field>
                  <value name="DELTA">
                    <shadow type="math_number" id="~u??+TEDx-A9jp={@kGW">
                      <field name="NUM">1</field>
                    </shadow>
                  </value>
                </block>
              </next>
            </block>
          </statement>
        </block>
      </next>
    </block>
  </statement>
</block>
<block type="p5_setup" id="+h@z:yJxEBLT97zihM8z" deletable="false" x="-37" y="56">
  <field name="CANVAS_NAME" id="F@~^-bHSYZB|!r,d8KAv">sketch</field>
  <statement name="SETUP">
    <block type="p5_create_canvas" id="Ga*qnbJk,S2]j\`(xe2I)">
      <value name="WIDTH">
        <shadow type="math_number" id="tZ|pM\`|LC+BhpCXLBLi#">
          <field name="NUM">500</field>
        </shadow>
      </value>
      <value name="HEIGHT">
        <shadow type="math_number" id="N?[-Dl~f!@10[WgC\`PQ\`">
          <field name="NUM">500</field>
        </shadow>
      </value>
      <next>
        <block type="p5_background_color" id="1U(tj;X6Adz=@yP/F!mF">
          <value name="COLOUR">
            <shadow type="colour_picker" id="c.Er@3J($G$Ju/ypEMcn">
              <field name="COLOUR">#ffffff</field>
            </shadow>
          </value>
          <next>
            <block type="variables_set" id="bSjEs+$AiZ3b*kJo$2iQ">
              <field name="VAR" id="4.0w9?Cl+krwxS6=fXQ8">circle size</field>
              <value name="VALUE">
                <block type="math_number" id="{PREG]\`Cq\`ZOoSc[bP2k">
                  <field name="NUM">50</field>
                </block>
              </value>
              <next>
                <block type="variables_set" id="4+3K)RS/D;#L5p/Cc?Dg">
                  <field name="VAR" id="()Kdhx}GQ07cCE57=X)l">fill</field>
                  <value name="VALUE">
                    <block type="colour_picker" id="0u%MWDc[~yM3WO9M9X)%">
                      <field name="COLOUR">#000000</field>
                    </block>
                  </value>
                  <next>
                    <block type="procedures_callnoreturn" id="t0\`HWpd8nJH,|nFbbu.u">
                      <mutation name="init circles"/>
                      <next>
                        <block type="p5_no_stroke" id="p6OfDjX,c!2ys(C@#IjR"/>
                      </next>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </next>
        </block>
      </next>
    </block>
  </statement>
</block>
<block type="procedures_defnoreturn" id="rS-|.kl=aQXH%Z!#Qt\`]" x="512" y="264">
  <field name="NAME">init circles</field>
  <comment pinned="false" h="80" w="160">Describe this function...</comment>
  <statement name="STACK">
    <block type="variables_set" id="VK0y{|-YCt/_\`n-a_0%E">
      <field name="VAR" id="IS2wa_zJQB+yW0]:^5ZM">circle positions</field>
      <value name="VALUE">
        <block type="lists_create_with" id="rB3BW3Hr[_(dtwVQf?-1">
          <mutation items="0"/>
        </block>
      </value>
      <next>
        <block type="variables_set" id="2}*;m-@BFDNuB:PQa?g=">
          <field name="VAR" id="G{j@ec:XlY,64_wlyO!G">circle colors</field>
          <value name="VALUE">
            <block type="lists_create_with" id="F;v)7(nj]u:lG4|-Tn#R">
              <mutation items="0"/>
            </block>
          </value>
          <next>
            <block type="variables_set" id="^M6G5wH$g8LU^bo!U!|N">
              <field name="VAR" id="ya4E;!y$me~mUjJ$cf|z">circle x</field>
              <value name="VALUE">
                <block type="math_number" id="yZg?XPp$UOti[R[k($v4">
                  <field name="NUM">25</field>
                </block>
              </value>
              <next>
                <block type="controls_repeat_ext" id="~Y0V+-Nt9v[x4Dyx]1@%">
                  <value name="TIMES">
                    <shadow type="math_number" id="2HqANg7$!M(so@Lj!1XL">
                      <field name="NUM">9</field>
                    </shadow>
                  </value>
                  <statement name="DO">
                    <block type="lists_setIndex" id="1g74J9ckWMUAW{gXo@h#">
                      <mutation at="false"/>
                      <field name="MODE">INSERT</field>
                      <field name="WHERE">LAST</field>
                      <value name="LIST">
                        <block type="variables_get" id="Z2(%wLDCoC_p;-z.98vj">
                          <field name="VAR" id="IS2wa_zJQB+yW0]:^5ZM">circle positions</field>
                        </block>
                      </value>
                      <value name="TO">
                        <block type="p5_coordinate" id="0^Gvg?;UaxJ6+._n6KHG">
                          <value name="X">
                            <shadow type="math_number" id=";@_4,$%HTX(XVrf~;1a6">
                              <field name="NUM">50</field>
                            </shadow>
                            <block type="variables_get" id="f]fllHrzq_k6[QLVUV/(">
                              <field name="VAR" id="ya4E;!y$me~mUjJ$cf|z">circle x</field>
                            </block>
                          </value>
                          <value name="Y">
                            <shadow type="math_number" id="kk(o48/?RbA8c~UD+tt3">
                              <field name="NUM">50</field>
                            </shadow>
                          </value>
                        </block>
                      </value>
                      <next>
                        <block type="lists_setIndex" id="p7K78(.RfR*N.kSx/HP9">
                          <mutation at="false"/>
                          <field name="MODE">INSERT</field>
                          <field name="WHERE">LAST</field>
                          <value name="LIST">
                            <block type="variables_get" id="M*VtFl66q]IC7,\`V-yC7">
                              <field name="VAR" id="G{j@ec:XlY,64_wlyO!G">circle colors</field>
                            </block>
                          </value>
                          <value name="TO">
                            <block type="colour_random" id="Nb]O4@fd#SB3SF|+;)7I"/>
                          </value>
                          <next>
                            <block type="math_change" id="VWB9p/?Sh5!?C7{pHv[t">
                              <field name="VAR" id="ya4E;!y$me~mUjJ$cf|z">circle x</field>
                              <value name="DELTA">
                                <shadow type="math_number" id=":p1C1O@s),.j/J;F!nm9">
                                  <field name="NUM">55</field>
                                </shadow>
                                <block type="math_arithmetic" id="EE096DF%j_Ry~bP74)!1">
                                  <field name="OP">ADD</field>
                                  <value name="A">
                                    <shadow type="math_number" id="/!op:#wK!BRH,CO,b;SY">
                                      <field name="NUM">1</field>
                                    </shadow>
                                    <block type="variables_get" id="}CaaA_(6B_mH:U^^eWj%">
                                      <field name="VAR" id="4.0w9?Cl+krwxS6=fXQ8">circle size</field>
                                    </block>
                                  </value>
                                  <value name="B">
                                    <shadow type="math_number" id="x8vIQr57i\`7GNxLAr$fR">
                                      <field name="NUM">5</field>
                                    </shadow>
                                  </value>
                                </block>
                              </value>
                            </block>
                          </next>
                        </block>
                      </next>
                    </block>
                  </statement>
                </block>
              </next>
            </block>
          </next>
        </block>
      </next>
    </block>
  </statement>
</block>
<block type="p5_draw" id="XHpxneww)x,b)Nt^1HlE" deletable="false" x="-80" y="426">
  <field name="CANVAS_NAME" id="F@~^-bHSYZB|!r,d8KAv">sketch</field>
  <statement name="DRAW">
    <block type="variables_set" id="_vQ7lJC+7te(8p{/Qz{y">
      <field name="VAR" id="1h/!($M#LTD\`C5XjmH-L">i</field>
      <value name="VALUE">
        <block type="math_number" id="P8r+)md3U;7iV!XW,QpT">
          <field name="NUM">1</field>
        </block>
      </value>
      <next>
        <block type="controls_repeat_ext" id=")HOB(lQ^@tjc}Hg)hF[A">
          <value name="TIMES">
            <shadow type="math_number" id="D#tDUU%[k}l{o7q3G_6a">
              <field name="NUM">9</field>
            </shadow>
          </value>
          <statement name="DO">
            <block type="p5_fill_color" id="vB@nQ)sqZ;D,:1F3SO!Q">
              <value name="COLOUR">
                <shadow type="colour_picker" id="Q?!!jG?{F5ST^~2aWX-Y">
                  <field name="COLOUR">#ff0000</field>
                </shadow>
                <block type="lists_getIndex" id="zE(BTA2a?n9gm1)v=+8;">
                  <mutation statement="false" at="true"/>
                  <field name="MODE">GET</field>
                  <field name="WHERE">FROM_START</field>
                  <value name="VALUE">
                    <block type="variables_get" id="m6OH|8@.=(v(=d@2?lWB">
                      <field name="VAR" id="G{j@ec:XlY,64_wlyO!G">circle colors</field>
                    </block>
                  </value>
                  <value name="AT">
                    <block type="variables_get" id=".oui$8sWp0Bh\`}zv95gE">
                      <field name="VAR" id="1h/!($M#LTD\`C5XjmH-L">i</field>
                    </block>
                  </value>
                </block>
              </value>
              <next>
                <block type="p5_ellipse" id="{PAbcV]N|pY(we.hDT9s">
                  <value name="CENTER">
                    <block type="lists_getIndex" id="IfZDc70?*Ua}QQLL;Lj[">
                      <mutation statement="false" at="true"/>
                      <field name="MODE">GET</field>
                      <field name="WHERE">FROM_START</field>
                      <value name="VALUE">
                        <block type="variables_get" id="bfx~)!r1pAvjajhFQ%l*">
                          <field name="VAR" id="IS2wa_zJQB+yW0]:^5ZM">circle positions</field>
                        </block>
                      </value>
                      <value name="AT">
                        <block type="variables_get" id="ESvUpD/SX0R+k-m));y.">
                          <field name="VAR" id="1h/!($M#LTD\`C5XjmH-L">i</field>
                        </block>
                      </value>
                    </block>
                  </value>
                  <value name="WIDTH">
                    <shadow type="math_number" id="wWOa%|j^/}fcGbrz:xa?">
                      <field name="NUM">20</field>
                    </shadow>
                    <block type="variables_get" id="CZlF;k=*~L!9ZCq1%m6w">
                      <field name="VAR" id="4.0w9?Cl+krwxS6=fXQ8">circle size</field>
                    </block>
                  </value>
                  <value name="HEIGHT">
                    <shadow type="math_number" id="y|y6PQl%Z$?5zRU,W=JY">
                      <field name="NUM">10</field>
                    </shadow>
                    <block type="variables_get" id="r[==@6nu,HvwI7oFFqx2">
                      <field name="VAR" id="4.0w9?Cl+krwxS6=fXQ8">circle size</field>
                    </block>
                  </value>
                  <next>
                    <block type="math_change" id="ixt$tUss=fMkjamz=pn[">
                      <field name="VAR" id="1h/!($M#LTD\`C5XjmH-L">i</field>
                      <value name="DELTA">
                        <shadow type="math_number" id="LUSC]gSA7o1vc!}Lhq5J">
                          <field name="NUM">1</field>
                        </shadow>
                      </value>
                    </block>
                  </next>
                </block>
              </next>
            </block>
          </statement>
          <next>
            <block type="p5_fill_color" id="C#B@*/~JTrQ#r,Kex)Wh">
              <value name="COLOUR">
                <shadow type="colour_picker" id="nM(??_1D|]9%n^.!?1n,">
                  <field name="COLOUR">#ff0000</field>
                </shadow>
                <block type="variables_get" id="NjtG$X!4bLa~vs4h8~u.">
                  <field name="VAR" id="()Kdhx}GQ07cCE57=X)l">fill</field>
                </block>
              </value>
              <next>
                <block type="controls_if" id="~:m2^M^2d}d+*T/Ng)id">
                  <value name="IF0">
                    <block type="p5_mouse_is_pressed" id="S_)n4x@{pWV^q+,FD)}~"/>
                  </value>
                  <statement name="DO0">
                    <block type="p5_ellipse" id="~]|bGc7N@#;|7WamoCSV">
                      <value name="CENTER">
                        <block type="p5_coordinate" id="A~j+DT$W_*Tb43p2Z,iF">
                          <value name="X">
                            <shadow type="math_number" id="K{D6GUH-[uXO=ADB-K95">
                              <field name="NUM">50</field>
                            </shadow>
                            <block type="p5_mouse_x" id="ZBvl^P:-Q@,~H^Wx%,h|"/>
                          </value>
                          <value name="Y">
                            <shadow type="math_number" id="-_H@WIB%50Vidy-Qwej0">
                              <field name="NUM">50</field>
                            </shadow>
                            <block type="p5_mouse_y" id="2/n\`K:=F7{!o3VQQ;myy"/>
                          </value>
                        </block>
                      </value>
                      <value name="WIDTH">
                        <shadow type="math_number" id="+La6RvoY8L@pvl\`9}NA6">
                          <field name="NUM">20</field>
                        </shadow>
                      </value>
                      <value name="HEIGHT">
                        <shadow type="math_number" id="86udx(FY%YEmf;/F!5\`z">
                          <field name="NUM">20</field>
                        </shadow>
                      </value>
                    </block>
                  </statement>
                </block>
              </next>
            </block>
          </next>
        </block>
      </next>
    </block>
  </statement>
</block>
</xml>`;
