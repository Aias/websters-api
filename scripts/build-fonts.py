# /// script
# requires-python = ">=3.12"
# dependencies = ["fonttools[woff]~=4.67.0"]
# ///
import io
import math
import re
import unicodedata
import urllib.request
import zipfile
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables import otTables as ot
from fontTools.varLib.instancer import instantiateVariableFont

OLD_STANDARD = 'https://mirrors.ctan.org/fonts/oldstandard.zip'
BESLEY = 'https://github.com/google/fonts/raw/85c5cea9da66117723c05bf5d7a7143fd10a411b/ofl/besley/Besley%5Bwght%5D.ttf'
OUT = Path(__file__).resolve().parents[1] / 'app' / 'fonts'
DOTLESS = {0x69: 0x131, 0x6A: 0x237}


def fetch(url):
    with urllib.request.urlopen(url) as response:
        return response.read()


def map_codepoint(font, codepoint, name):
    for table in font['cmap'].tables:
        if table.isUnicode():
            table.cmap[codepoint] = name


def add_mark(font, name, codepoint, draw):
    cff = font['CFF '].cff
    top = cff.topDictIndex[0]
    pen, box = T2CharStringPen(0, None), BoundsPen(None)
    draw(pen)
    draw(box)
    top.CharStrings.charStringsIndex.append(pen.getCharString(private=top.Private, globalSubrs=cff.GlobalSubrs))
    top.CharStrings.charStrings[name] = len(top.CharStrings.charStringsIndex) - 1
    top.charset.append(name)
    font.setGlyphOrder(top.charset)
    font['hmtx'][name] = (0, round(box.bounds[0]))
    font['GDEF'].table.GlyphClassDef.classDefs[name] = 3
    map_codepoint(font, codepoint, name)


def patch_old_standard(font):
    cmap, glyphs = font.getBestCmap(), font.getGlyphSet()
    macron, acute, o = cmap[0x304], cmap[0x301], cmap[0x6F]
    lookups = font['GPOS'].table.LookupList.Lookup
    slant = math.tan(math.radians(-font['post'].italicAngle))

    def subtables(kind):
        return [st for lookup in lookups if lookup.LookupType == kind for st in lookup.SubTable]

    def mark_anchor(st, glyph):
        anchor = st.MarkArray.MarkRecord[st.MarkCoverage.glyphs.index(glyph)].MarkAnchor
        return anchor.XCoordinate, anchor.YCoordinate

    def bounds(glyph):
        pen = BoundsPen(glyphs)
        glyphs[glyph].draw(pen)
        return pen.bounds

    ax, ay = mark_anchor(next(st for st in subtables(4) if acute in st.MarkCoverage.glyphs), acute)
    _, acute_bottom, _, acute_top = bounds(acute)
    _, macron_bottom, _, macron_top = bounds(macron)
    width, bottom = macron_top - macron_bottom, acute_bottom
    top = bottom + round(0.62 * (acute_top - acute_bottom))
    x = lambda y: ax + (y - ay) * slant
    tick = [(round(x(bottom) - width / 2), bottom), (round(x(bottom) + width / 2), bottom), (round(x(top) + width / 2), top), (round(x(top) - width / 2), top)]

    def draw_tick(pen):
        pen.moveTo(tick[0])
        for point in tick[1:]:
            pen.lineTo(point)
        pen.closePath()

    add_mark(font, 'uni030D', 0x030D, draw_tick)
    for st in subtables(4):
        if acute in st.MarkCoverage.glyphs:
            st.MarkCoverage.glyphs.append('uni030D')
            st.MarkArray.MarkRecord.append(st.MarkArray.MarkRecord[st.MarkCoverage.glyphs.index(acute)])
            st.MarkArray.MarkCount += 1
    for st in subtables(6):
        if acute in st.Mark1Coverage.glyphs and macron in st.Mark2Coverage.glyphs:
            acute_record = st.Mark1Array.MarkRecord[st.Mark1Coverage.glyphs.index(acute)]
            perch = st.Mark2Array.Mark2Record[st.Mark2Coverage.glyphs.index(macron)].Mark2Anchor[0]
            gap = perch.YCoordinate + bottom - acute_record.MarkAnchor.YCoordinate - macron_top
            record, record.MarkAnchor = ot.MarkRecord(), ot.Anchor()
            record.Class, record.MarkAnchor.Format = acute_record.Class, 1
            record.MarkAnchor.XCoordinate = acute_record.MarkAnchor.XCoordinate
            record.MarkAnchor.YCoordinate = acute_record.MarkAnchor.YCoordinate + gap - round(width / 4)
            st.Mark1Coverage.glyphs.append('uni030D')
            st.Mark1Array.MarkRecord.append(record)
            st.Mark1Array.MarkCount += 1
            mx, my = mark_anchor(next(s for s in subtables(4) if macron in s.MarkCoverage.glyphs), macron)
            stack = (perch.XCoordinate - mx - record.MarkAnchor.XCoordinate, perch.YCoordinate - my - record.MarkAnchor.YCoordinate)

    macron_letters = {
        glyph: cmap[DOTLESS.get(base, base)]
        for codepoint, glyph in cmap.items()
        if (m := re.fullmatch(r'([0-9A-F]{4,5}) 0304', unicodedata.decomposition(chr(codepoint))))
        and (base := int(m[1], 16)) in cmap
        and DOTLESS.get(base, base) in cmap
    }
    for st in subtables(4):
        if 'uni030D' not in st.MarkCoverage.glyphs:
            continue
        assert st.ClassCount == 1
        tx, ty = mark_anchor(st, 'uni030D')
        pairs = list(zip(st.BaseCoverage.glyphs, st.BaseArray.BaseRecord))
        for glyph, base in macron_letters.items():
            if glyph in st.BaseCoverage.glyphs or base not in st.BaseCoverage.glyphs:
                continue
            base_anchor = st.BaseArray.BaseRecord[st.BaseCoverage.glyphs.index(base)].BaseAnchor[0]
            record, anchor = ot.BaseRecord(), ot.Anchor()
            anchor.Format, anchor.XCoordinate, anchor.YCoordinate = 1, base_anchor.XCoordinate + stack[0] + tx, base_anchor.YCoordinate + stack[1] + ty
            record.BaseAnchor = [anchor]
            pairs.append((glyph, record))
        pairs.sort(key=lambda pair: font.getGlyphID(pair[0]))
        st.BaseCoverage.glyphs, st.BaseArray.BaseRecord = [g for g, _ in pairs], [r for _, r in pairs]
        st.BaseArray.BaseCount = len(pairs)

    base_st = next(st for st in subtables(4) if macron in st.MarkCoverage.glyphs and o in st.BaseCoverage.glyphs)
    mx, my = mark_anchor(base_st, macron)
    o_anchor = base_st.BaseArray.BaseRecord[base_st.BaseCoverage.glyphs.index(o)].BaseAnchor[0]
    advance, middle = font['hmtx'][o][0], sum(bounds(macron)[0::2]) / 2
    outline = RecordingPen()
    glyphs[macron].draw(outline)
    move = lambda p: (round(p[0] - mx + o_anchor.XCoordinate - (advance if p[0] < middle else 0)), round(p[1] - my + o_anchor.YCoordinate))

    def draw_double_macron(pen):
        for operator, points in outline.value:
            getattr(pen, operator)(*map(move, points))

    add_mark(font, 'uni035E', 0x035E, draw_double_macron)


def patch_besley(font, donor):
    donor_cmap, donor_glyphs, glyf = donor.getBestCmap(), donor.getGlyphSet(), font['glyf']
    scale = font['OS/2'].sCapHeight / donor['OS/2'].sCapHeight
    for codepoint in (0x2032, 0x02CA, 0x2016, 0x2035):
        name, pen = f'uni{codepoint:04X}', TTGlyphPen(None)
        donor_glyphs[donor_cmap[codepoint]].draw(TransformPen(Cu2QuPen(pen, 1, reverse_direction=True), (scale, 0, 0, scale, 0, 0)))
        glyf[name] = glyph = pen.glyph()
        glyph.recalcBounds(glyf)
        font['hmtx'][name] = (round(donor['hmtx'][donor_cmap[codepoint]][0] * scale), glyph.xMin)
        map_codepoint(font, codepoint, name)
    font.setGlyphOrder(glyf.glyphOrder)


def save(font, name):
    font.flavor = 'woff2'
    font.save(OUT / f'{name}.woff2')


archive = zipfile.ZipFile(io.BytesIO(fetch(OLD_STANDARD)))
old_standard = lambda style: TTFont(io.BytesIO(archive.read(f'oldstandard/opentype/OldStandard-{style}.otf')))
for style in ('Regular', 'Italic', 'BoldItalic'):
    font = old_standard(style)
    patch_old_standard(font)
    save(font, f'OldStandard-{style}')
besley = instantiateVariableFont(TTFont(io.BytesIO(fetch(BESLEY))), {'wght': 800})
patch_besley(besley, old_standard('Bold'))
save(besley, 'Besley-ExtraBold')
