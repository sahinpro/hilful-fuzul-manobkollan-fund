import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeadershipMember } from "@/lib/site/leadership";
import { Award, Briefcase } from "lucide-react";

type Translate = (key: string) => string;

function splitByCategory(members: LeadershipMember[]) {
  const advisors = members.filter((m) => m.category === "advisor");
  const executives = members.filter((m) => m.category === "executive");
  return { advisors, executives };
}

function LeadershipTableBlock(props: {
  title: string;
  icon: typeof Award;
  rows: LeadershipMember[];
  t: Translate;
}) {
  const { title, icon: Icon, rows, t } = props;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <span className="inline-flex rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="size-4 shrink-0" aria-hidden />
        </span>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12 px-3 text-center text-muted-foreground">
              {t("pages.about.leadership.tableSl")}
            </TableHead>
            <TableHead className="px-3">{t("pages.about.leadership.tableName")}</TableHead>
            <TableHead className="px-3">{t("pages.about.leadership.tableFathersName")}</TableHead>
            <TableHead className="px-3">{t("pages.about.leadership.tableDesignation")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="px-3 py-6 text-center text-sm text-muted-foreground"
              >
                {t("pages.about.leadership.emptyList")}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell className="px-3 text-center tabular-nums text-muted-foreground">
                  {index + 1}
                </TableCell>
                <TableCell className="px-3 font-medium text-foreground">{row.full_name}</TableCell>
                <TableCell className="px-3 text-muted-foreground">
                  {row.fathers_name?.trim() ? row.fathers_name : "—"}
                </TableCell>
                <TableCell className="max-w-48 whitespace-normal px-3 text-muted-foreground sm:max-w-none">
                  {row.designation?.trim() ? row.designation : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}

export function AboutLeadershipTables(props: {
  members: LeadershipMember[];
  t: Translate;
}) {
  const { members, t } = props;
  const { advisors, executives } = splitByCategory(members);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{t("pages.about.leadership.sectionTitle")}</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <LeadershipTableBlock
          title={t("pages.about.leadership.advisorsTitle")}
          icon={Award}
          rows={advisors}
          t={t}
        />
        <LeadershipTableBlock
          title={t("pages.about.leadership.executivesTitle")}
          icon={Briefcase}
          rows={executives}
          t={t}
        />
      </div>
    </div>
  );
}
