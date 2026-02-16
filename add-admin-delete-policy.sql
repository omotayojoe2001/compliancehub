-- Allow admins to delete user profiles
CREATE POLICY "Admins can delete profiles"
ON profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND email IN ('joshuaomotayo10@gmail.com', 'admin@taxandcompliance.com.ng')
  )
);
