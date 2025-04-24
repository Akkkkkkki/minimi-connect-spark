create policy "Insert own AF"
on "public"."activity_feedback"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM activity_participant ap
  WHERE ((ap.activity_id = ap.activity_id) AND (ap.profile_id = auth.uid())))));


create policy "Delete AT by owner"
on "public"."activity_tag"
as permissive
for delete
to authenticated
using ((EXISTS ( SELECT 1
   FROM activity a
  WHERE ((a.id = activity_tag.activity_id) AND (a.creator_id = auth.uid())))));


create policy "Insert AT by owner"
on "public"."activity_tag"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM activity a
  WHERE ((a.id = activity_tag.activity_id) AND (a.creator_id = auth.uid())))));


create policy "Insert chat"
on "public"."chat_message"
as permissive
for insert
to authenticated
with check (((auth.uid() = sender_id) AND (EXISTS ( SELECT 1
   FROM match m
  WHERE ((m.id = chat_message.match_id) AND ((m.profile_id_1 = auth.uid()) OR (m.profile_id_2 = auth.uid())))))));


create policy "Insert own QR"
on "public"."questionnaire_response"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM activity_participant ap
  WHERE ((ap.id = questionnaire_response.participant_id) AND (ap.profile_id = auth.uid())))));



